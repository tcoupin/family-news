var express = require('express');
var extend = require('extend');

var multer = require('multer');
var storage = require('gridfs-storage-engine')({url: conf.mongodb});
var upload = multer({ storage: storage });

var async = require('async');
var Videos = require('../../../model/index').videos;

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

router.post('/:id/upload',upload.array('file'),function(req,res){
	async.each(
		req.files,
		function(file,done){
			Videos.new(file.originalname, file.gridfsEntry._id, req.params.id, done);
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

router.post('/:id/thumbnail',upload.single('file'),function(req,res){
	console.log(Object.keys(req.body))
	Videos.setThumbnail(req.params.id,req.file.gridfsEntry._id,function(err){
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