var page=0;
var more_news=true;
var load = false;
var wall;
function nextPage(){
	offset=0;
	$('.news-item').each(function(){
		var top = $(this).offset().top;
		if (top >= offset){
			offset = top;
		}
	})
	if (!more_news || !(offset-$(window).height() <= $(window).scrollTop()) || load){
		return;
	}
	load = true;
	$.get("/news/list?start="+page,function(data){
		if (data.length == 0){
			more_news = false;
			return;
		}
		page++;
		$("#gridContent").append(data);
		setTimeout(function(){load = false;nextPage()},500);
	})
}


var offset = 0;
$(function(){
	nextPage();
	$(window).scroll(function(){
		nextPage();
	});
	$('#gridContent').pinterest_grid({
		no_columns: 4,
        padding_x: 10,
        padding_y: 10,
        margin_bottom: 50,
	});
});
