var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var extend = require('extend');

var COLLECTION_NAME = 'users';
var LOGGER=require("log4js").getLogger(COLLECTION_NAME);

mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	if (err){LOGGER.fatal(err);return}
	db.createCollection(COLLECTION_NAME,function(err){
		if (err){LOGGER.fatal(err);return}
	})
});

// Check root
mongodb.MongoClient.connect(conf.mongodb, function(err, db) {
	db.collection(COLLECTION_NAME).stats(function(err,stat){
		if (err){return;}
		if (stat.count == 1){
			LOGGER.warn("Un seul utilisateur => passage en admin");
			db.collection(COLLECTION_NAME).updateOne({},{$addToSet:{role: 'view'}},function(err){
				if (err){
					LOGGER.fatal(err);
					return;
				}
				db.collection(COLLECTION_NAME).updateOne({},{$addToSet:{role: 'admin'}},function(err){
					if (err){
						LOGGER.fatal(err);
						return;
					}	
				})
			});
		}
	});
});

var Users = {};


Users.findOrCreate = function(profile, callback){
	LOGGER.debug('findOrCreate',profile.displayName);
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).findOne({id: profile.id},function(err,user){
			if (err){callback(err)}
			LOGGER.trace('findOrCreate',JSON.stringify(user));
			if (user == null){
				LOGGER.debug('findOrCreate','create user');
				db.collection(COLLECTION_NAME).insert(extend(profile,{role:[]}),
					function(err){
						callback(err,profile);
					}
				);
			} else {
				LOGGER.debug('findOrCreate','find user');
				callback(err,user);
			}
		})
	});
}

Users.setToken = function(id,token, callback){
	LOGGER.debug('setToken',id,token);
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).updateOne({id:id},{$set:{token:token}},callback);
	});
}
Users.findByToken = function(token,callback){
	LOGGER.debug('findByToken',token);
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).findOne({token: token},callback);
	});
}

Users.getNewUsers = function(callback){
	LOGGER.debug('getNewUsers');
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).find({role:[]}).toArray(callback);
	});
}
Users.getUsers = function(sort,callback){
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).find({'role.0':{$exists:true}}).sort([[sort.key,sort.dir]]).toArray(callback);
	});
}
Users.addRole = function(id,role,callback){
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).updateOne({_id: new mongodb.ObjectId(id)},{$addToSet:{role: role}},callback);
	});
}
Users.removeRole = function(id,role,callback){
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).updateOne({_id: new mongodb.ObjectId(id)},{$pullAll:{role: [role]}},callback);
	});
}
Users.removeAllRole = function(id,callback){
	MongoClient.connect(conf.mongodb, function(err, db) {
		if (err){callback(err)}
		db.collection(COLLECTION_NAME).updateOne({_id: new mongodb.ObjectId(id)},{"$set":{role: []}},callback);
	});
}
module.exports = Users;