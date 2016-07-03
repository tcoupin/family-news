var express = require('express');
var extend = require('extend');
var Users = require('../../model/index').users;

var router=express.Router();

router.get('/new',function(req,res){
	Users.getNewUsers(function(err,users){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		console.log(users)
		res.render('admin/users/new',extend(null,conf.view,{section:"Utilisateurs", action:"Accepter",user:req.user,users:users}));
	})
});
router.get('/new/:id',function(req,res){
	Users.addRole(req.params.id,'view',function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/users/new');
	})
});
router.get('/view',function(req,res){
	var sort = {key: 'displayName', dir: 1};
	if (req.query.sortK !== undefined){
		sort.key = req.query.sortK;
	}
	if (req.query.sortD !== undefined){
		sort.dir = parseInt(req.query.sortD);
	}

	Users.getUsers(sort,function(err,users){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.render('admin/users/view',extend(null,conf.view,{section:"Utilisateurs", action:"Gérer",user:req.user,users:users,sort:sort}));
	})
});
router.get('/view/ban/:id',function(req,res){
	if (req.params.id == req.user._id){
		res.render('errors/500',{detail:"On ne s'auto supprime pas !"})
		return;
	}
	Users.removeAllRole(req.params.id,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/users/view');
	})
});
router.get('/view/unadmin/:id',function(req,res){
	if (req.params.id == req.user._id){
		res.render('errors/500',{detail:"On ne s'enlève pas le droit d'admin !"})
		return;
	}
	Users.removeRole(req.params.id,'admin',function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/users/view');
	})
});
router.get('/view/admin/:id',function(req,res){
	Users.addRole(req.params.id,'admin',function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/users/view');
	})
});

module.exports = router;