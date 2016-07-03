var express = require('express');
var extend = require('extend');
var async = require('async');

var Model = require('../../model/index');
var Files = require('../../model/index').files;
var Folders = require('../../model/index').folders;
var Images = require('../../model/index').images;
var Videos = require('../../model/index').videos;

var router=express.Router();

/*-----------------------------------------
* API Routes
*/
var folders = require('./storage/folders');
router.use('/folders',folders);

var images = require('./storage/images');
router.use('/images',images);

var videos = require('./storage/videos');
router.use('/videos',videos);
//------------------------------------------

router.get('/view',function(req,res){
	Folders.getRoot(function(err,doc){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/storage/view/'+doc._id);
	})
})

router.get('/view/:id',function(req,res){
	var data = {folders:{},images:{},videos:{}};
	var path = [];
	Folders.get(req.params.id,function(err,doc){
		if (err){res.render('errors/500',{detail:err});return;}
		data.folders[req.params.id] = doc;
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
				if (err){res.render('errors/500',{detail:err});return;}
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
						if (err){res.render('errors/500',{detail:err});return;}
						var mainDoc = data.folders[req.params.id];
						var key = req.query.key || "_id";
						var sens = req.query.sens || 1;
						mainDoc.content.sort(sort(data,key,sens));
						res.render(
							'admin/storage/view',
							extend(
								null,
								conf.view,
								{
									section:"Stockage",
									action:"Gérer",
									user:req.user,
									folder:req.params.id,
									data: data,
									data_str: JSON.stringify(data),
									path:path
								}
							)
						);
					}
				);
			}
		);
	})
})



router.get('/quota',function(req,res){
	async.parallel(
		[
			Files.stats,
			Folders.stats,
			Images.stats,
			Videos.stats
		],
		function(err,results){
			if (err){
				res.render('errors/500',{detail:err});
				return;
			}
			results[0].chunks.size = bytesToSize(results[0].chunks.size);
			results[0].chunks.storageSize = bytesToSize(results[0].chunks.storageSize);
			res.render('admin/storage/quota',extend(null,conf.view,{section:"Stockage", action:"Quota",user:req.user, stats: results}));
		}
	)
})

function bytesToSize(bytes) {
    var sizes = ['o', 'Ko', 'Mo', 'Go', 'To'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

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
module.exports = router;