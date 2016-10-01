var express = require('express');
var extend = require('extend');
var async = require('async');
var Model = require('../../model/index');
var News = Model.news;
var Folders = Model.folders;

var bodyParser = require('body-parser');

var router=express.Router();


router.post('/new',bodyParser.urlencoded(),function(req,res){
	var news = req.body;
	news.comment=(news.comment===undefined?false:true);
	News.new(news,function(err,id){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/news/'+id+'/media');
	})
})
router.post('/:id',bodyParser.urlencoded(),function(req,res){
	var news = req.body;
	news.comment=(news.comment===undefined?false:true);
	News.update(req.params.id,news,function(err){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.redirect('/admin/news');
	})
})
router.get('/:id',function(req,res){
	News.get(req.params.id,function(err,news){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		res.json(news);
	})
});
router.get('/',function(req,res){
	var start = 0;
	var nb = 5;
	if (req.query.start !== undefined){
		start = Number.parseInt(req.query.start);
	}
	async.parallel({
		count: function(done){
			News.count(done);
		},
		news: function(done){
			News.getSome(start,nb,done);
		}
	}, function(err,results){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		
		var pages=[];
		for (var i=0;i<results.count;i+=nb){
			pages.push({start: i, active:(Math.abs(i-start)<nb)});
		}
		res.render('admin/news/view',extend(null,conf.view,{section:"News", user:req.user, news:results.news, pages:pages}));
	})
});

router.delete('/:id',function(req,res){
	News.delete(req.params.id,function(err){
		if (err){
			res.status(500).end(err);
			return;
		}
		res.end();
	});
})

router.get("/:id/media",function(req,res){
	News.get(req.params.id,function(err,news){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		Folders.getRoot(function(err,doc){
			if (err){
				res.render('errors/500',{detail:err});
				return;
			}
			res.render('admin/news/media',extend(null,conf.view,{section:"News", action:"Gérer les médias", user:req.user, news: news, rootId: doc._id}));
		})
	})
});

router.put("/:id/media",bodyParser.json(),function(req,res){
	News.get(req.params.id,function(err,news){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		async.each(
			req.body,
			function(content,done){
				News.addContent(req.params.id,content,done);
			},
			function(err){
				if (err){
					res.status(400).end(err);
					return;
				}
				res.end();
			}
		);
	})
});

router.delete("/:id/media",bodyParser.json(),function(req,res){
	News.get(req.params.id,function(err,news){
		if (err){
			res.render('errors/500',{detail:err});
			return;
		}
		News.removeContent(req.params.id,req.body,function(err){
			if (err){
				res.status(400).end(err);
				return;
			}
			res.end();
		});
	})
});

router.get("/foldermodalcontent/:id",function(req,res){
	Model.getFolderData(
		{
			id:req.params.id
		},
		function(err,output){
			res.render('admin/news/foldermodalcontent',output);
		}
	);
})

router.get("/:id/comment",function(req,res){
	res.render('admin/news/comment',extend(null,conf.view,{section:"News", action:"Gérer les commentaires", user:req.user}));
});

module.exports = router;