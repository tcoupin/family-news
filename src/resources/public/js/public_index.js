 $(function(){
 	$("#index-carousel").swiperight(function() {  
    	$(this).carousel('prev');  
	});  
	$("#index-carousel").swipeleft(function() {  
	    $(this).carousel('next');  
	}); 
})