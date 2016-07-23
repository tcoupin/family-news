var progressBar="il manque la progressBar";

function setFolder(id){
	$("#addContent .modal-body").empty().append(progressBar);
	$.get("/admin/news/foldermodalcontent/"+id,function(data){
		$("#addContent .modal-body").empty().append(data);
		setHandler();
	});
}
function setHandler(){
	$(".set-folder").click(function(){
		setFolder($(this).data("id"));
	})
	$(".content").click(function(){
		if ($(this).hasClass("content-selected")){
			$(this).removeClass("content-selected")
		} else {
			$(this).addClass("content-selected")
		}
	})

}

$(function(){
	progressBar = $("#addContent .modal-body").html();
	setFolder(rootId);
	$("#addContent .btn-submit").click(function(){
		var contentToUp = [];
		$("#addContent .content-selected").each(function(){
			contentToUp.push({id:$(this).data("id"), type:$(this).data("type")})
		});
		$.ajax({
        	type:'PUT',
        	url: 'media',
        	contentType:"application/json",
        	data:JSON.stringify(contentToUp),
        	success:function(data){
				window.location.reload();
        	},
        	error: function(data){
        		$("#addContent .modal-footer").prepend('<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+data.status+": "+data.responseText+'</div>')
        	}
    	});
	});
	$(".remove-content").click(function(){
		var content={id:$(this).data("id"), type:$(this).data("type")};
		
		$.ajax({
        	type:'DELETE',
        	url: 'media',
        	contentType:"application/json",
        	data:JSON.stringify(content),
        	success:function(data){
				window.location.reload();
        	},
        	error: function(data){
        		$("#content").append('<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+data.status+": "+data.responseText+'</div>')
        	}
    	});
	});
})