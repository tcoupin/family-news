var express = require('express');
var extend = require('extend');
var async = require('async');
var Model = require('../../model');
var News = Model.news;
var router=express.Router();

router.get('/',function(req,res){
	res.render('public/news_all',
		extend(null,conf.view,{user:req.user})
	);
});

router.get("/list",function(req,res){
	var start = 0;
	var nb = 5;
	if (req.query.start !== undefined){
		start = Number.parseInt(req.query.start);
	}
	News.getSome(start*nb,nb,function(err,news){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.render('public/news_list',extend(null,conf.view,{user:req.user, news:news}));
		//res.json(news);
	});
})

router.get("/list_raw",function(req,res){
	var start = 0;
	var nb = 5;
	if (req.query.start !== undefined){
		start = Number.parseInt(req.query.start);
	}
	News.getSome(start*nb,nb,function(err,news){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.json(news);
	});
})

module.exports = router;