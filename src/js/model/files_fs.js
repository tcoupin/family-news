module.exports = function(path){
	var getSize = require('get-folder-size');
	var multer = require('multer');
	var async = require('async');
	var upload = multer({ dest: path });
	var mongodb = require('mongodb');
	var fs = require('fs');
	
	var COLLECTION_NAME="files"
	var LOGGER=require("log4js").getLogger(COLLECTION_NAME);
	
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){LOGGER.fatal(err);return;}
		db.createCollection(COLLECTION_NAME,function(err){
			if (err){LOGGER.fatal(err);return;}
		});
	});
	
	var Files = {};

	/*
	En gridFS :
	{ 	
		"_id" : ObjectId("57eee592b735de3b984f08ff"),
		"length" : 57930,
		"chunkSize" : 261120,
		"uploadDate" : ISODate("2016-09-30T22:22:11.435Z"),
		"md5" : "e465c02c7d44f6e22087e970faaddeb9",
		"filename" : "96_image_1403444926789.jpeg"
	}
	 */

	Files.uploadArray = function(name){
		return function(req,res,next){
			upload.array(name)(req,res,function(){
				console.log(JSON.stringify(req.files))
				mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
					if (err){res.status(500).end(err);return}
					async.each(
						req.files,
						function(file,done){
							db.collection(COLLECTION_NAME).insert(
								{
									length:file.size,
									uploadDate: Date.now(),
									filename: file.originalname
								},
								function(err,results){
									if (err){done(err);return}
									file._id = results.insertedIds[0];
									fs.renameSync(path+"/"+file.filename,path+"/"+file._id)
									done();
								}
							);
						},
						function(err){
							if (err){res.status(500).end(err);return}
							next();
						}
					)
				});
			})
		}
	};

	Files.uploadSingle = function(name){
		return function(req,res,next){
			upload.single(name)(req,res,function(){
				mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
					if (err){res.status(500).end(err);return}
					db.collection(COLLECTION_NAME).insert({length:req.file.size, uploadDate: Date.now(), filename: req.file.originalname},function(err,results){
						if (err){res.status(500).end(err);return}
						req.file._id=results.insertedIds[0]
						fs.renameSync(path+"/"+req.file.filename,path+"/"+req.file._id)
						next();
					});
				});
			})
		}
	};
	
	Files.new = function(name,callback){
		mongodb.MongoClient.connect(conf.mongodb,
			function(err, db) {
				if (err){callback(err);return;}
				db.collection(COLLECTION_NAME).insert({uploadDate: Date.now(), filename: name},function(err,results){
					var writeStm = fs.createWriteStream(path+'/'+results.insertedIds[0]);
					writeStm.id = results.insertedIds[0];
					callback(err,writeStm);
				});
			}
		);
	};
	
	Files.get = function(id,callback){
		LOGGER.debug("getFile "+id);
		try {
			fs.statSync(path+'/'+id)
			var readStm = fs.createReadStream(path+'/'+id);
			callback(null, readStm);
		} catch (e) {
			callback('notfound');
		}
	}
	
	Files.delete = function(id,callback){
		LOGGER.debug("deleteFile "+id);
		mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
			if (err){callback(err);return;}
			db.collection(COLLECTION_NAME).findOne({_id: new mongodb.ObjectId(id)},function(err,file){
				if (err){callback(err)};
				if (file === undefined){
					callback('notfound');
					return;
				}
				fs.unlink(path+"/"+id,function(err){
					if (err){callback(err)};
					db.collection(COLLECTION_NAME).deleteOne({_id: new mongodb.ObjectId(id)},callback)
				})
			})
		});
	}
	
	Files.stats = function(callback){
		LOGGER.debug("stats");
		mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
			if (err){callback(err);return;}
			db.collection(COLLECTION_NAME).stats(function(err,statsFiles){
				if (err){callback(err);return;}
				getSize(path, function(err, size) {
					callback(err,{size:size,count:statsFiles.count});
				});
			});
		});	
	}
	
	return Files;
}