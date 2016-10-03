var mongodb = require('mongodb');
var async = require('async');
var Images;
var Videos;
var Messages;

var COLLECTION_NAME="folders"
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);

// Check root
LOGGER.debug("Vérification du folder root");
mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	db.collection(COLLECTION_NAME).findOne({parent_id:undefined},function(err,folder){
		if (err){LOGGER.fatal(err);return;}
		if (folder === undefined || folder === null){
			LOGGER.warn("Création du folder root");
			db.collection(COLLECTION_NAME).insert({name: "Home", content: []},function(err){
				if (err){LOGGER.fatal(err);return;}
			});
		}
	});
});


var Folders = {};

Folders._setImages = function(img){
	Images = img;
}
Folders._setVideos = function(vdo){
	Videos = vdo;
}
Folders._setMessages = function(msg){
	Messages = msg;
}

Folders.get = function(id,callback){
	LOGGER.debug("get "+id)
	if ((typeof id) == 'string' && id.length != 24){
		id = "000000000000000000000000";
	}
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).findOne({_id: new mongodb.ObjectId(id)},callback);
	});
}

Folders.getRoot = function(callback){
	LOGGER.debug("getRoot")
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		db.collection(COLLECTION_NAME).findOne({parent:undefined},function(err,results){
			LOGGER.trace("Root id is "+results._id)
			Folders.get(results._id.toString(),callback);
		})
	});
}

Folders.new = function(name,parent_id,callback){
	LOGGER.debug('Nouveau Folder '+name+' dans '+parent_id)
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		LOGGER.trace("Création du folder")
		db.collection(COLLECTION_NAME).insert({name: name, parent: parent_id, content: []},function(err,results){
			if (err){callback(err);return}
			LOGGER.trace("Ajout de la référence du folder dans le folder parent")
			Folders.addContent(parent_id,{type:'folders',id: results.insertedIds[0]},function(err){
				callback(err,results.insertedIds[0]);
			})
		});
	});
}

Folders.rename = function(id,name,callback){
	LOGGER.debug("Renommage de "+id+" en "+name)
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).updateOne(
			{_id: new mongodb.ObjectId(id)},
			{'$set':{name: name}},
			function(err,results){
				callback(err,results.upsertedId);
			}
		);
	});	
}

Folders.delete = function(id,callback){
	LOGGER.info("Delete",id);
	debugger;
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		async.waterfall(
			[
				function(done){
					Folders.get(id,done);
				},
				function(doc,done){
					if (doc == null){
						LOGGER.warn("doc null on delete")
						done("doc null");
						return;
					}
					async.each(
						doc.content,
						function(item,done){
							LOGGER.trace("Content item",item)
							if (item.type == 'folders'){
								Folders.delete(item.id.toString(),done);
							} else if (item.type == 'images'){
								Images.delete(item.id.toString(),done);
							} else if (item.type == 'videos'){
								Videos.delete(item.id.toString(),done);
							} else {
								done("unknow type "+item.type);
							}
						},
						function(err){
							done(err,doc);
						}
					);
				},
				function(doc,done){
					if (doc.parent === undefined || doc.parent === null){
						//Root dir
						done(null,doc)
						return;
					}
					LOGGER.info("Delete",id, "remove parent ref");
					Folders.removeContent(doc.parent,{type:'folders',id: doc._id},function(err){
						done(err,doc);
					})
				},
				function(doc,done){
					if (doc.parent === undefined || doc.parent === null){
						//Root dir
						done();
						return;
					}
					LOGGER.info("Delete",id,"delete in db");
					db.collection(COLLECTION_NAME).findOneAndDelete({_id: new mongodb.ObjectId(id)},done);
				}
			],
			callback
		);
	});
}
Folders.addContent = function(id,content,callback){
	LOGGER.debug("Ajout à",id,content)
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		db.collection(COLLECTION_NAME).updateOne(
			{_id: new mongodb.ObjectId(id)},
			{$addToSet: {content: content}},
			callback
		)
	});	
}
Folders.removeContent = function(id,content,callback){
	LOGGER.debug("Retrait de",id,content)
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		db.collection(COLLECTION_NAME).updateOne(
			{_id: new mongodb.ObjectId(id)},
			{$pull: {content: content}},
			callback
		)
	});	
}

Folders.stats = function(callback){
	LOGGER.debug("stats")
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		db.collection(COLLECTION_NAME).stats(callback);
	});	
}

module.exports = Folders;