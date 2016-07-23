var mongodb = require('mongodb');
var async = require('async');
var im = require('imagemagick-stream');

var COLLECTION_NAME="images"
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);

var Folders;
var Files = require('./files');

mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return}
	db.createCollection(COLLECTION_NAME,function(err){
		if (err){LOGGER.fatal(err);return}
	})
});

var Images = {};

Images._setFolders = function(folders){
	Folders = folders;
}

Images.new = function(name,file_id,parent_id,callback){
	LOGGER.debug("create "+name+" from file "+file_id+" in parent "+parent_id);
	async.waterfall(
		[
			function(done){
				mongodb.MongoClient.connect(conf.mongodb, done);
			},
			function(db,done){
				LOGGER.trace("Création de l'objet images");
				db.collection(COLLECTION_NAME).insert({name: name, parent: parent_id, date: Date.now(), files: {raw: file_id}},
					function(err,results){
						done(err,db,results.insertedIds[0]);
				});
			},
			function(db,id,done){
				LOGGER.trace("Mise à jour du parent folders de l'objet images");
				Folders.addContent(parent_id, {type:'images',id: id}, function(err){done(err,db,id)});	
			},
			function(db,id,done){
				LOGGER.trace("Création image réduite");
				var resize = im().resize('800x800').quality(90);
				Files.get(file_id,function(err,inputStream){
					if (err){done(err);return;}
					Files.new(name,function(err,outputStream){
						inputStream.pipe(resize).pipe(outputStream);
						outputStream.on('finish',function(){
							db.collection(COLLECTION_NAME).updateOne({_id: id},{$set: {'files.small': outputStream.id}},function(err){
								done(err,db,id);
							})
						})
					})
				})
			},
			function(db,id,done){
				LOGGER.trace("Création image miniature");
				var resize = im().resize('200x200').quality(90);
				Files.get(file_id,function(err,inputStream){
					if (err){done(err);return;}
					Files.new(name,function(err,outputStream){
						inputStream.pipe(resize).pipe(outputStream);
						outputStream.on('finish',function(){
							db.collection(COLLECTION_NAME).updateOne({_id: id},{$set: {'files.thumbnail': outputStream.id}},function(err){
								done(err,id);
							})
						})
					})
				})
			}
		],
		callback
	);
};

Images.get = function(id,callback){
	if ((typeof id) == 'string' && id.length != 24){
		id = "000000000000000000000000";
	}
	LOGGER.debug("get "+id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).findOne({_id: new mongodb.ObjectId(id)},callback);
	});
}

Images.addNews = function(id,id_news,callback){
	LOGGER.debug("addNews",id,id_news);

	async.waterfall(
		[
			function(done){
				mongodb.MongoClient.connect(conf.mongodb, done);			
			},
			function(db,done){
				LOGGER.trace("Ajout du lien");
				db.collection(COLLECTION_NAME).updateOne(
					{"_id": new mongodb.ObjectId(id)},
					{"$addToSet":{"news": id_news}},
					function(err,results){
						done(err);
					}
				);
			}
		],
		callback
	);
}

Images.removeNews = function(id,id_news,callback){
	LOGGER.debug("removeNews",id,id_news);

	async.waterfall(
		[
			function(done){
				mongodb.MongoClient.connect(conf.mongodb, done);			
			},
			function(db,done){
				LOGGER.trace("Ajout du lien");
				db.collection(COLLECTION_NAME).updateOne(
					{"_id": new mongodb.ObjectId(id)},
					{"$pull":{"news": id_news}},
					function(err,results){
						done(err);
					}
				);
			}
		],
		callback
	);
}


Images.delete = function(id,callback){
	LOGGER.debug("delete "+id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		async.waterfall(
			[
				function(done){
					LOGGER.trace("Récupération de l'objet images");
					Images.get(id,done);
				},
				function(doc,done){
					LOGGER.trace("Retrait de la référence du parent folders de l'objet images");
					if (doc.parent === undefined || doc.parent === null){
						//Root dir
						LOGGER.warning("Le dossier root n'a pas de parent");
						done(null,doc)
						return;
					}
					Folders.removeContent(doc.parent,{type:'images',id: doc._id},function(err){
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


Images.stats = function(callback){
	LOGGER.debug("stats")
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		db.collection(COLLECTION_NAME).stats(callback);
	});	
}


module.exports = Images;