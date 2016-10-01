var express = require('express');
var extend = require('extend');

var router=express.Router();


var multer = require('multer');
var storage = require('gridfs-storage-engine')({url: conf.mongodb});
var upload = multer({ storage: storage });

var async = require('async');
var Images = require('../../../model/index').images;

var router=express.Router();

router.get("/:id",function(req,res){
	Images.get(req.params.id,function(err,img){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		if (img === null){
			res.render('errors/404');
			return;
		}
		res.json(img);
	});
})

router.post('/:id/upload',upload.array('file'),function(req,res){
	var files_ids=[]
	async.each(
		req.files,
		function(file,done){
			Images.new(file.originalname, file.gridfsEntry._id, req.params.id, function(err,id){
				files_ids.push(id);
				done(err);
			});
		},
		function(err){
			if (err){
				res.render('errors/500',{detail:err});
				return;
			}
			res.json(files_ids);
		}
	);
})


router.delete("/:id",function(req,res){
	Images.delete(req.params.id,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.end();
	});
})

router.post("/:id/rotate/direct",function(req,res){
	Images.rotate(req.params.id,90,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.end();
	});
})

router.post("/:id/rotate/reverse",function(req,res){
	Images.rotate(req.params.id,-90,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.end();
	});
})

module.exports = router;