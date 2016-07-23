function getFormData(){
	var data = {};
	data.title = $("#inputTitle").val();
	data.text = $("#inputText").val();
	data.comment = $("#inputComment").prop("checked")==true?true:false;
	return data;
}
function setFormData(data){
	$("#inputTitle").val(data.title);
	$("#inputText").val(data.text);
	$("#inputComment").prop("checked",data.comment);
}

var newsToDelete = -1;
function deleteNews(){
	if (newsToDelete == -1){
		return;
	}
	$.ajax({
  		type: "DELETE",
  		url: "/admin/news/"+newsToDelete+"?time="+Date.now(),
  		success: function(){
  			window.location.reload();
  		},
      error: function(data){
        $("#deleteNews .modal-footer").prepend('<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+data.status+": "+data.responseText+'</div>')
      }
	});
}
$(function(){
  	$('[data-toggle="popover"]').popover({html:true});
  	
	$(".form-change").change(function(){
		console.log("Save form")
		sessionStorage.setItem("news",JSON.stringify(getFormData()));
	});

  	if (sessionStorage.getItem("news") !== null){
  		setFormData(JSON.parse(sessionStorage.getItem("news")))
  	}

  	$("#newNews form").submit(function(){
  		sessionStorage.removeItem("news");
  	})
  	$("#newNews").on('shown.bs.modal',function(e){
		$("#newNews input[name=title]").focus();
	}).on('hide.bs.modal',function(){
		$("#newNews form").attr("action","news/new")
		$("#newNews .btn-submit").empty().append("Créer");
		if (sessionStorage.getItem("news") !== null){
  			setFormData(JSON.parse(sessionStorage.getItem("news")))
  		} else {
  			setFormData({title:"",text:"",comment:true});
  		}
	});


  	$(".delete-news").click(function(){
  		$("#deleteNews").modal('show');
  		newsToDelete = $(this).data('id');
  	})
  	$("#deleteNews .btn-submit").click(deleteNews);

  	$(".update-news").click(function(){
  		$("#newNews form").attr("action","news/"+$(this).data('id'))
  		$("#newNews .btn-submit").empty().append("Modifier");
  		$.get("news/"+$(this).data('id'),function(data){
  			setFormData(data);
  			$("#newNews").modal('show');
  		})
  	})

})