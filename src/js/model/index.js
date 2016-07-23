
var Files = require('./files');
var Folders = require('./folders');
var Videos = require('./videos');
var Images = require('./images');
var Messages = require('./messages');
var News = require('./news');
var async = require('async');
var extend = require('extend');


// SETUP Dependencies
/*
Folders => images
		=> videos
		=> messages
*/
Folders._setImages(Images);
Folders._setVideos(Videos);
Folders._setMessages(Messages);
/*
Videos  => folders
		=> files
*/
Videos._setFolders(Folders);
/*
Images  => folders
		=> files
*/
Images._setFolders(Folders);

News._setMessages(Messages);
News._setImages(Images);
News._setVideos(Videos);

var getFolderData = function(opt,callback){
	var data = {folders:{},images:{},videos:{}};
	var path = [];
	Folders.get(opt.id,function(err,doc){
		if (err){callback(err);return;}
		data.folders[opt.id] = doc;
		async.each(
			doc.content,
			function(item,done){
				Model[item.type].get(item.id,function(err,doc){
					if (doc.date){
						doc.dateStr = (new Date(doc.date)).toLocaleString();
					}
					data[item.type][item.id]=doc;
					done(err);
				})
			},
			function(err){
				if (err){callback(err);return;}
				var cur=doc;
				async.until(
					function(){return cur.parent==undefined},
					function(done){
						Folders.get(cur.parent,function(err,par_doc){
							if (err){done(err);return;}
							path.unshift(par_doc);
							cur=par_doc;
							done();
						})		
					},
					function(err){
						if (err){callback(err);return;}
						var mainDoc = data.folders[opt.id];
						var key = opt.key || "_id";
						var sens = opt.sens || 1;
						mainDoc.content.sort(sort(data,key,sens));
						callback(null,{
									folder:opt.id,
									data: data,
									data_str: JSON.stringify(data),
									path:path
							}
						);
					}
				);
			}
		);
	})
}

function sort(data,key,sens){
	return function(a,b){
			var A = a.type.toLowerCase();
     		var B = b.type.toLowerCase();
     		if (A < B){
        		return -1;
     		}else if (A > B){
       			return  1;
     		}else{
     			if (data[a.type][a.id][key] === undefined || data[b.type][b.id][key] === undefined){
     				return 0;
     			}
       			var A = data[a.type][a.id][key].toString().toLowerCase();
     			var B = data[b.type][b.id][key].toString().toLowerCase();
     			if (A < B){
        			return -1*sens;
     			}else if (A > B){
       				return  1*sens;
     			}else{
       				return 0;
     			}
     		}
		}
};

var Model = {
	files: Files,
	folders: Folders,
	images: Images,
	users: require('./users'),
	videos: Videos,
	messages: Messages,
	news: News,
	getFolderData: getFolderData
}

module.exports = Model;