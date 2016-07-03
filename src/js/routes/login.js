var express = require('express');
var passport = require('passport');
var extend = require('extend');

var router=express.Router();

router.get('/',function(req,res){
	if (req.user !== undefined){
		res.redirect('/');
	} else {
		res.render('login', extend(null,conf.view,{path:req.query.path}));
	}
});
router.get('/auth/google',function(req,res,next){
 	passport.authenticate('google',
 		{
 			scope: [
 				'https://www.googleapis.com/auth/userinfo.profile',
 				'https://www.googleapis.com/auth/userinfo.email'
 			],
 			prompt: 'select_account',
 			state: (req.query.path!==undefined?''+req.query.path:'/')
 		}
 	)(req,res,next)
 });
router.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/login' }),
 	function(req, res) {
 		if (req.query.state !== undefined){
 			res.redirect(req.query.state);
 		} else {
			res.redirect('/');
 		}
  	}
);
router.get('/logout', function(req, res){
  	req.logout();
  	res.redirect('/login');
});

module.exports = router;