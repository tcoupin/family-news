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
	Model.getFolderData(
		{
			id:req.params.id,
			key:req.query.key,
			sens:req.query.sens
		},
		function(err,output){
			if (err){res.render('errors/500',{detail:err});return;}
			res.render(
				'admin/storage/view',
				extend(
					null,
					conf.view,
					{
						section:"Stockage",
						action:"Gérer",
						user:req.user
					},
					output
				)
			);
		}
	);
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


module.exports = router;