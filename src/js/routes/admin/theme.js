var express = require('express');
var extend = require('extend');
var fs = require('fs');

var Model = require('../../model/index');


var router=express.Router();

router.get('/',function(req,res){
	var listTheme = fs.readdirSync("./src/resources/public/css/vendor/boostwatch");
	res.render(
		'admin/theme',
		extend(
			null,
			conf.view,
			{
				section:"Thème",
				action:"",
				user:req.user,
				listTheme: listTheme
			}
		)
	);
})
router.get('/:theme',function(req,res){
	Model.conf.set("theme",req.params.theme, function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		global.conf.view.theme = req.params.theme;
		res.redirect('/admin/theme');
	})
})

module.exports = router;