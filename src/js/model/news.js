var mongodb = require('mongodb');
var async = require('async');

var COLLECTION_NAME="news"
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);

var Messages;
var Images;
var Videos;

mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return}
	db.createCollection(COLLECTION_NAME,function(err){
		if (err){LOGGER.fatal(err);return}
	})
});

var News = {};

News._setMessages = function(msg){
	Messages = msg;
}
News._setImages = function(img){
	Images = img;
}
News._setVideos = function(vdo){
	Videos = vdo;
}

News.new = function(msg,callback){
	LOGGER.debug("new");
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		msg.timestamp = Date.now();
		msg.content=[],
		db.collection(COLLECTION_NAME).insertOne(msg,function(err,opsResult){
			callback(err);
			Messages.new({type:"news",action:"new",news_id:opsResult.insertedId.toString()});
		});
	});
}

News.update = function(id,msg,callback){
	LOGGER.debug("update",id,msg);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).updateOne({_id: new mongodb.ObjectId(id)},{"$set":msg},function(err,opsResult){
			callback(err);
			Messages.new({type:"news",action:"update",news_id:id});
		});
	});
}

News.getSome = function(start,nb,callback){
	LOGGER.debug("getSome",start,nb);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).find().sort([['timestamp',-1]]).skip(start).limit(nb).toArray(
			function(err,news){
				if (err){callback(err);return;}
				for (var i in news){
					news[i].timestampStr = (new Date(news[i].timestamp)).toLocaleString();
					news[i].badge = {images:0,videos:0,comments:0};
					if (!news[i].comment){
						news[i].badge.comments = -1;
					}
					for (var j in news[i].content){
						news[i].badge[news[i].content[j].type]++;
					}
				}
				callback(null,news);
			}
		);
	});	
}

News.get = function(id,callback){
	LOGGER.debug("get",id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).findOne({_id: new mongodb.ObjectId(id)},callback);
	});	
}

News.count = function(callback){
	LOGGER.debug("count");
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).count({},callback);
	});		
}

News.addContent = function(id,content,callback){
	LOGGER.debug("addContent",id,content);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).updateOne(
			{
				_id: new mongodb.ObjectId(id)
			},
			{
				"$addToSet": {content: content}
			},
			function(err){
				if (err){callback(err);return;}
				Messages.new({type:"news",action:"addContent",news_id:id,content:content});
				if (content.type == "videos"){
					Videos.addNews(content.id,id,callback);
				} else if (content.type == "images"){
					Images.addNews(content.id,id,callback);
				} else {
					callback("unknow type "+content.type);
				}
			}
		);
	});	
}

News.removeContent = function(id,content,callback){
	LOGGER.debug("addContent",id,content);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).updateOne(
			{
				_id: new mongodb.ObjectId(id)
			},
			{
				"$pull": {content: content}
			},
			function(err){
				if (err){callback(err);return;}
				Messages.new({type:"news",action:"removeContent",news_id:id,content:content});
				if (content.type == "videos"){
					Videos.removeNews(content.id,id,callback);
				} else if (content.type == "images"){
					Images.removeNews(content.id,id,callback);
				} else {
					callback("unknow type "+content.type);
				}
			}
		);
	});	
}

News.delete = function(id,callback){
	LOGGER.debug("delete",id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		async.waterfall(
			[
				function(done){
					LOGGER.trace("Récupération de l'objet news");
					News.get(id,done);
				},
				function(doc,done){
					LOGGER.trace("Suppression des liens des media");
					async.each(
						doc.content,
						function(content,cb){
							if (content.type == "videos"){
								Videos.removeNews(content.id,id,cb);
							} else if (content.type == "images"){
								Images.removeNews(content.id,id,cb);
							} else {
								cb("unknow type "+content.type);
							}
						},
						done
					);
				},
				function(done){
					LOGGER.trace("Suppression de l'objet news");
					db.collection(COLLECTION_NAME).findOneAndDelete({_id: new mongodb.ObjectId(id)},done);
				}
			],
			function(err){
				if (err){LOGGER.error(err)}
				callback(err);
			}
		);
	});	
}

module.exports = News;