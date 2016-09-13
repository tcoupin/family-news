var page=0;
var more_news=true;
var load = false;
var wall;
function nextPage(){
	console.log("Next page")
	offset=0
	$('.news-item').each(function(){
		var top = $(this).offset().top;
		if (top >= offset){
			offset = top;
		}
	})
	if (!more_news || !(offset-$(window).height() <= $(window).scrollTop()) || load){
		console.log("finish : no update")
		console.log("more_news",more_news,"scroll",(offset-$(window).height() <= $(window).scrollTop()),"load",load)
		return;
	}
	load = true;
	$.get("/news/list?start="+page,function(data){
		if (data.length == 0){
			more_news = false;
			return;
		}
		page++;
		$("#fwContent").append(data);
		wall.container.find('.news-item img').load(function() {
			wall.fitWidth();
			nextPage();
		});
		load = false;
		console.log("finish : load page "+page);
		nextPage()
		
	})
}


var offset = 0;
$(function(){
	nextPage();
	wall = new Freewall('#fwContent');
	wall.reset({
		cacheSize:false,
		animate:true,
		delay:30,
		selector: '.news-item',
		cellW:200,
		cellH:'auto',
		onResize: function() {
			wall.fitWidth();
		}
	});
	wall.fitWidth()
	


	$(window).scroll(function(){
		nextPage();
	});
});