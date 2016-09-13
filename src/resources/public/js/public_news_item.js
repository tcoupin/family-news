var wall;

$(function(){
	wall = new Freewall('#media');
	wall.reset({
		cacheSize:false,
		animate:true,
		delay:30,
		selector: '.media-item',
		cellW:100,
		cellH:100,
		onResize: function() {
			wall.fitWidth();
		}
	});
	wall.fitWidth()
});