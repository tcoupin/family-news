var express = require('express');
var extend = require('extend');

var router=express.Router();

router.get('/',function(req,res){
	res.render('admin/index',extend(null,conf.view,{section:"Admin", action:"Index",user:req.user}));
});


var users = require('./admin/users');
router.use('/users',users);

var storage = require('./admin/storage');
router.use('/storage',storage);

var news = require('./admin/news');
router.use('/news',news);

var theme = require('./admin/theme');
router.use('/theme',theme);

module.exports = router;