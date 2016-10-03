var express = require('express');
var extend = require('extend');



var async = require('async');
var Model = require('../../../model/index');
var Videos = Model.videos;

var Files = Model.files;

var router=express.Router();

router.get("/:id",function(req,res){
	Videos.get(req.params.id,function(err,video){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		if (video === null){
			res.render('errors/404');
			return;
		}
		res.json(video);
	});
})

router.post('/:id/upload',Files.uploadArray('file'),function(req,res){
	async.each(
		req.files,
		function(file,done){
			Videos.new(file.originalname, file._id, req.params.id, done);
		},
		function(err){
			if (err){
				res.render('errors/500',{detail:err});
				return;
			}
			res.end();
		}
	);
})

router.post('/:id/thumbnail',Files.uploadSingle('file'),function(req,res){
	console.log(Object.keys(req.body))
	Videos.setThumbnail(req.params.id,req.file._id,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.end();
	});
})

router.delete("/:id",function(req,res){
	Videos.delete(req.params.id,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.end();
	});
})

module.exports = router;