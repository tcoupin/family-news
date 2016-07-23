var mongodb = require('mongodb');
var async = require('async');

var COLLECTION_NAME="messages"
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);


mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return}
	db.createCollection(COLLECTION_NAME,function(err){
		if (err){LOGGER.fatal(err);return}
	})
});

var Messages = {};

Messages.new = function(msg){
	LOGGER.debug("new");
	mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){LOGGER.error(err);return}
		msg.timestamp = Date.now();
		db.collection(COLLECTION_NAME).insert(msg,function(err){
			if (err){LOGGER.error(err);return}
		});
	});
}

module.exports = Messages;