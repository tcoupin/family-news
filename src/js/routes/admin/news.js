var express = require('express');
var extend = require('extend');

var router=express.Router();

router.get('/new',function(req,res){
	res.render('admin/news/new',extend(null,conf.view,{section:"News", action:"Créer",user:req.user}));
});
router.get('/view',function(req,res){
	res.render('admin/news/view',extend(null,conf.view,{section:"News", action:"Gérer",user:req.user}));
});
module.exports = router;