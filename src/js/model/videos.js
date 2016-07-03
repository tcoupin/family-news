var mongodb = require('mongodb');
var async = require('async');
var spawn = require('child_process').spawn;
var Files = require('./files');
var Folders;

var COLLECTION_NAME = 'videos';
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);

mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return}
	db.createCollection(COLLECTION_NAME,function(err){
		if (err){LOGGER.fatal(err);return}
	})
});


var Videos={};

Videos._setFolders = function(folders){
	Folders = folders;
}

Videos.new = function(name,file_id,parent_id,callback){
	LOGGER.debug("create "+name+" from file "+file_id+" in parent "+parent_id);

	async.waterfall(
		[
			function(done){
				mongodb.MongoClient.connect(conf.mongodb, done);			
			},
			function(db,done){
				LOGGER.trace("Création de l'objet videos");
				db.collection(COLLECTION_NAME).insert({name: name, parent: parent_id, date: Date.now(), files: {video:file_id}},
					function(err,results){
						done(err,db,results.insertedIds[0]);
					}
				);
			},
			function(db,id,done){
				LOGGER.trace("Mise à jour du parent folders de l'objet videos");
				Folders.addContent(parent_id, {type:'videos',id: id}, function(err){done(err)});	
			}
		],
		callback
	);
}

Videos.setThumbnail = function(id,file_id,callback){
	LOGGER.debug("create thumbnail for "+id+" from file "+file_id);

	async.waterfall(
		[
			function(done){
				mongodb.MongoClient.connect(conf.mongodb, done);			
			},
			function(db,done){
				LOGGER.trace("Ajout du lien");
				db.collection(COLLECTION_NAME).updateOne(
					{"_id": new mongodb.ObjectId(id)},
					{"$set":{"files.thumbnail": file_id}},
					function(err,results){
						done(err);
					}
				);
			}
		],
		callback
	);
}


Videos.get = function(id,callback){
	if ((typeof id) == 'string' && id.length != 24){
		id = "000000000000000000000000";
	}
	LOGGER.debug("getVideo "+id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).findOne({_id: new mongodb.ObjectId(id)},callback);
	});
}

Videos.delete = function(id,callback){
	LOGGER.debug("deleteVideo "+id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		async.waterfall(
			[
				function(done){
					LOGGER.trace("Récupération de l'objet videos");
					Videos.get(id,done);
				},
				function(doc,done){
					LOGGER.trace("Retrait de la référence du parent folders de l'objet videos");
					if (doc.parent === undefined || doc.parent === null){
						//Root dir
						LOGGER.warning("Le dossier root n'a pas de parent");
						done(null,doc)
						return;
					}
					Folders.removeContent(doc.parent,{type:'videos',id: doc._id},function(err){
						done(err,doc);
					});
				},
				function(doc,done){
					//Delete file
					LOGGER.trace("Suppression des fichiers");
					async.each(
						Object.keys(doc.files),
						function(file,cb){
						LOGGER.trace("Suppression du fichier", file);
							Files.delete(doc.files[file],cb);
						},
						done
					);
				},
				function(done){
					LOGGER.trace("Suppression de l'objet videos");
					db.collection(COLLECTION_NAME).findOneAndDelete({_id: new mongodb.ObjectId(id)},done);
				}
			],
			callback
		);
	});
};

Videos.stats = function(callback){
	LOGGER.debug("stats");
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		db.collection(COLLECTION_NAME).stats(callback);
	});	
}

module.exports = Videos;