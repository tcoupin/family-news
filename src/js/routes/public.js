var express = require('express');
var extend = require('extend');
var async = require('async');
var Model = require('../model');
var router=express.Router();

router.get('/',function(req,res){
	req.user.isAdmin =(req.user.role.indexOf('admin')!=-1);
	async.parallel(
		{
			news: function(done){
				Model.news.getSome(0,5,done);
			},
		},
		function(err,results){
			res.render('public/index',
				extend(null,conf.view,{user:req.user,news: results.news})
			);
		}
	);
});

module.exports = router;