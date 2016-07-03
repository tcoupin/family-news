var express = require('express');
var extend = require('extend');
var Folders = require('../../../model/index').folders;

var router=express.Router();

router.get("/",function(req,res){
	Folders.getRoot(function(err,folder){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.json(folder);
	});
})

router.get("/:id",function(req,res){
	Folders.get(req.params.id,function(err,folder){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		if (folder === null){
			res.render('errors/404');
			return;
		}
		res.json(folder);
	});
})

router.post("/:id/rename/:name",function(req,res){
	Folders.rename(req.params.id,req.params.name,function(err,id){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.json({id:id});
	});
})

router.post("/:id/:name",function(req,res){
	Folders.new(req.params.name,req.params.id,function(err,id){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.json({id:id});
	});
})
router.delete("/:id",function(req,res){
	Folders.delete(req.params.id,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.end('ok');
	});
});



module.exports = router;