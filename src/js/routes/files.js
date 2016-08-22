var express = require('express');
var router=express.Router();

var Files = require('../model/index').files;
var Videos = require('../model/index').videos;
var Images = require('../model/index').images;

router.get("/videos/:id",function(req,res){
	Videos.get(req.params.id,function(err,vdo){
		if (err){
			res.status(500).render('errors/500',{detail:err});
			return;
		} else if (vdo == null) {
			res.status(404).render('errors/404');
			return;
		}
		Files.get(vdo.files.video,function(err,stream){
			if (err){
				if (err == 'notfound'){
					res.status(404).render('errors/404');
				} else {
					res.status(500).render('errors/500',{detail:err});
				}
				return;
			}
			stream.pipe(res);
		});
	});
})


router.get("/videos/:id/:type",function(req,res){
	Videos.get(req.params.id,function(err,vdo){
		if (err){
			res.status(500).render('errors/500',{detail:err});
			return;
		} else if (vdo == null) {
			res.status(404).render('errors/404');
			return;
		}
		Files.get(vdo.files.thumbnail,function(err,stream){
			if (err){
				if (err == 'notfound'){
					res.status(404).render('errors/404');
				} else {
					res.status(500).render('errors/500',{detail:err});
				}
				return;
			}
			stream.pipe(res);
		});
	});
})

router.get("/images/:id",function(req,res){
	Images.get(req.params.id,function(err,img){
		if (err){
			res.status(500).render('errors/500',{detail:err});
			return;
		} else if (img == null) {
			res.status(404).render('errors/404');
			return;
		}
		Files.get(img.files.raw,function(err,stream){
			if (err){
				if (err == 'notfound'){
					res.status(404).render('errors/404');
				} else {
					res.status(500).render('errors/500',{detail:err});
				}
				return;
			}
			stream.pipe(res);
		});
	});
})

router.get("/images/:id/:type",function(req,res){
	Images.get(req.params.id,function(err,img){
		if (err){
			res.status(500).render('errors/500',{detail:err});
			return;
		} else if (img == null || img.files[req.params.type] == undefined) {
			res.status(404).render('errors/404');
			return;
		}
		Files.get(img.files[req.params.type],function(err,stream){
			if (err){
				if (err == 'notfound'){
					res.status(404).render('errors/404');
				} else {
					res.status(500).render('errors/500',{detail:err});
				}
				return;
			}
			stream.pipe(res);
		});
	});
})

module.exports = router;