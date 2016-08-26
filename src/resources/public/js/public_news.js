var page=0;
var more_news=true;
var load = false;
function nextPage(){
	load = true;
	$.get("/news/list?start="+page,function(data){
		if (data.length == 0){
			more_news = false;
			return;
		}
		page++;
		$("#news-list").append("<h3 id='page"+page+"'><small>Page "+page+"</small></h3><hr>");
		$("#news-list").append(data);
		$("#news-menu ul").append("<li role='presentation'><a href='#page"+page+"''>Page "+page+"</a></li>");
		load = false;
		offset = $('.panel:last').offset();
		$('body').scrollspy('refresh');
	})
	
}

var offset;
$(function(){
	nextPage();
	$(window).scroll(function(){
		if (offset == undefined){
			return;
		}
		if (more_news && (offset.top-$(window).height() <= $(window).scrollTop()) && load==false){
			nextPage();
		}
	});

});