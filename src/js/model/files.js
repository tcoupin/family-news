var multer = require('multer');
var storage = require('gridfs-storage-engine')({url: conf.mongodb});
var upload = multer({ storage: storage });
var mongodb = require('mongodb');

var COLLECTION_NAME="fs"
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);

mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return;}
	db.createCollection(COLLECTION_NAME+".chunks",function(err){
		if (err){LOGGER.fatal(err);return;}
		db.createCollection(COLLECTION_NAME+".files",function(err){
			if (err){LOGGER.fatal(err);return;}
			});
	});
	
});

var Files = {};

Files.new = function(name,callback){
	mongodb.MongoClient.connect(conf.mongodb,
		function(err, db) {
			if (err){callback(err);return;}
			var bucket = new mongodb.GridFSBucket(db,{bucketName: COLLECTION_NAME});
			var uploadStream = bucket.openUploadStream(name);
			callback(err,uploadStream);
		}
	);
};

Files.get = function(id,callback){
	LOGGER.debug("getFile "+id);
	try {
		id = new mongodb.ObjectId(id);
		mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
			if (err){callback(err)}
			var bucket = new mongodb.GridFSBucket(db,{bucketName: COLLECTION_NAME});
			bucket.find({_id: id}).toArray(function(err,files){
				if (err){callback(err);return};
				if (files === undefined || files.length == 0){
					callback('notfound');
					return;
				}
				var downloadStream = bucket.openDownloadStream(id);
				callback(err, downloadStream);
			})
			
		});
	} catch (err){
		callback(err);
	}
}

Files.delete = function(id,callback){
	LOGGER.debug("deleteFile "+id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		var bucket = new mongodb.GridFSBucket(db,{bucketName: COLLECTION_NAME});
		bucket.delete(new mongodb.ObjectId(id),callback);
	});
}

Files.stats = function(callback){
	LOGGER.debug("stats");
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return;}
		db.collection(COLLECTION_NAME+'.chunks').stats(function(err,statsChunks){
			if (err){callback(err);return;}
			db.collection(COLLECTION_NAME+'.files').stats(function(err,statsFiles){
				callback(err,{chunks:statsChunks,files:statsFiles});
			});
		});
	});	
}

module.exports = Files;