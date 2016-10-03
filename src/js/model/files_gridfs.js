module.exports = function (url){
	var multer = require('multer');
	var storage = require('gridfs-storage-engine')({url: url});
	var upload = multer({ storage: storage });
	var mongodb = require('mongodb');
	
	var COLLECTION_NAME="fs"
	var LOGGER=require("log4js").getLogger(COLLECTION_NAME);
	
	mongodb.MongoClient.connect(url, function(err, db) {
		if (err){LOGGER.fatal(err);return;}
		db.createCollection(COLLECTION_NAME+".chunks",function(err){
			if (err){LOGGER.fatal(err);return;}
			db.createCollection(COLLECTION_NAME+".files",function(err){
				if (err){LOGGER.fatal(err);return;}
				});
		});
		
	});
	
	var Files = {};

	Files.uploadArray = function(name){
		return function(req,res,next){
			upload.array(name)(req,res,function(){
				for (var i in req.files){
					req.files[i]._id=req.files[i].gridfsEntry._id;
				}
				next();
			})
		}
	};

	Files.uploadSingle = function(name){
		return function(req,res,next){
			upload.single(name)(req,res,function(){
				req.file._id=req.file.gridfsEntry._id;
				next();
			})
		}
	};
	
	Files.new = function(name,callback){
		mongodb.MongoClient.connect(url,
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
			mongodb.MongoClient.connect(url, function(err, db) {
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
		mongodb.MongoClient.connect(url, function(err, db) {
			if (err){callback(err);return;}
			var bucket = new mongodb.GridFSBucket(db,{bucketName: COLLECTION_NAME});
			bucket.delete(new mongodb.ObjectId(id),callback);
		});
	}
	
	Files.stats = function(callback){
		LOGGER.debug("stats");
		mongodb.MongoClient.connect(url, function(err, db) {
			if (err){callback(err);return;}
			db.collection(COLLECTION_NAME+'.chunks').stats(function(err,statsChunks){
				if (err){callback(err);return;}
				db.collection(COLLECTION_NAME+'.files').stats(function(err,statsFiles){
					callback(err,{size:statsChunks.size, count:statsFiles.count});
				});
			});
		});	
	}
	return Files
}
