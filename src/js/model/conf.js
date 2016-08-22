var mongodb = require('mongodb');
var async = require('async');

var COLLECTION_NAME="conf"
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);


mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return}
	db.createCollection(COLLECTION_NAME,function(err){
		if (err){LOGGER.fatal(err);return}
	})
});

var Conf = {};

Conf.get = function(id,callback){
	LOGGER.debug("get",id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).findOne({id: id},callback);
	});	
}

Conf.set = function(id,val,callback){
	LOGGER.debug("set",id);
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err);return}
		db.collection(COLLECTION_NAME).updateOne({id: id},{val: val},{upsert:true}, callback);
	});	
}

module.exports = Conf;