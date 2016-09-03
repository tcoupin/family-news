
function createFolder(name){
	$.post(
		"/admin/storage/folders/"+folder_id+"/"+name+"?time="+Date.now(),
		function(data){
			window.location.reload();
		},
		"json"
	);
}

function renameFolder(name){
	$.post(
		"/admin/storage/folders/"+folder_id+"/rename/"+name+"?time="+Date.now(),
		function(data){
			window.location.reload();
		},
		"json"
	);
}

var nb_todelete = 0;
function deleteItem(type,id,cb){
	$.ajax({
  		type: "DELETE",
  		url: "/admin/storage/"+type+"/"+id+"?time="+Date.now(),
  		success: function(){
  			if (cb !== undefined)  				{
  				cb(type,id);
  			}
  		}
	});
}

function sendVideo(){
	$("#addVideos .buttons").hide();
	$("#addVideos .progress").show();
	$("#addVideos .alert").hide();
	
	var formData = new FormData();
	var files = $("#addVideos form input")[0].files;
	for (var i in files){
		formData.append('file',files[i]);
	}

    $.ajax({
        type:'POST',
        url: '/admin/storage/videos/'+folder_id+'/upload',
        data:formData,
        xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){
                    myXhr.upload.addEventListener('progress',function(e){
                    	if(e.lengthComputable){
        					var max = e.total;
        					var current = e.loaded;
        					var Percentage = (current * 100)/max;
        					$("#addVideos .progress-bar").css('width',Percentage+'%').empty().append(Math.ceil(Percentage)+"%");
    					}  
                    },
                    false);
                }
                return myXhr;
        },
        cache:false,
        contentType: false,
        processData: false,
        success:function(data){
			window.location.reload();
        },
        error: function(data){
            $("#addVideos .alert").show();
            $("#addVideos .buttons").show();
			$("#addVideos .progress").hide();
        }
    });
}


function sendImage(){
	$("#addImages .buttons").hide();
	$("#addImages .progress").show();
	$("#addImages .alert").hide();
	
	var formData = new FormData();
	var files = $("#addImages form input")[0].files;
	for (var i in files){
		formData.append('file',files[i]);
	}

    $.ajax({
        type:'POST',
        url: '/admin/storage/images/'+folder_id+'/upload',
        data:formData,
        xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){
                    myXhr.upload.addEventListener('progress',function(e){
                    	if(e.lengthComputable){
        					var max = e.total;
        					var current = e.loaded;
        					var Percentage = (current * 100)/max;
        					$("#addImages .progress-bar").css('width',Percentage+'%').empty().append(Math.ceil(Percentage)+"%");
    					}  
                    },
                    false);
                }
                return myXhr;
        },
        cache:false,
        contentType: false,
        processData: false,
        success:function(data){
			window.location.reload();
        },
        error: function(data){
            $("#addImages .alert").show();
            $("#addImages .buttons").show();
			$("#addImages .progress").hide();
        }
    });
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

function showContent(type,id){
	$("#showContent .modal-header").append("<h4>"+data[type][id].name+" <small>"+data[type][id].dateStr+"</small></h4>")
	if (type == 'images'){
		$("#showContent .modal-body").append("<img class='center-block img-responsive small' src='/files/images/"+id+"/small'/>");
		$("#showContent .modal-footer .buttons").append("<div class='btn-group' role='group'>");
		$("#showContent .modal-footer .buttons").append("<button class='btn btn-default image-rotate' href='#' type='button' data-id='"+id+"' data-sens='reverse'><i class='fa fa-rotate-left' aria-hidden='true'></i></button>");
		$("#showContent .modal-footer .buttons").append("<button class='btn btn-default image-rotate' href='#' type='button' data-id='"+id+"' data-sens='direct'><i class='fa fa-rotate-right' aria-hidden='true'></i></button>");
		$("#showContent .modal-footer .buttons").append("</div>");
		$(".image-rotate").click(function(){
			$("#showContent .alert").hide();
			$("#showContent .buttons").hide();
			$("#showContent .progress").show();
			var sens = $(this).data('sens');
			$.ajax({
    			    type:'POST',
    			    url: '/admin/storage/images/'+id+'/rotate/'+sens,
    			    cache:false,
    			    contentType: false,
    			    processData: false,
    			    success:function(data){
						window.location.reload();
    			    },
    			    error: function(data){
    			    	$("#showContent .alert").show().empty().append(data);
            			$("#showContent .buttons").show();
						$("#showContent .progress").hide();
    			    }
    			});
		})
	} else if (type == 'videos'){
		$("#showContent .modal-body").append("<video class='center-block img-responsive' src='/files/videos/"+id+"' controls poster='/files/videos/"+id+"/thumbnail'></video>");
		if (data.videos[id].files.thumbnail === undefined){
			$("#showContent .modal-footer .buttons").append("<button type='button' class='btn btn-danger video-make-snap' data-id='"+id+"'>Enregistrer la miniature</button>")
			$(".video-make-snap").click(function(){
				$("#showContent .alert").hide();
				$("#showContent .buttons").hide();
				$("#showContent .progress").show();
				var video = $("video")[0];
        		var canvas = document.createElement("canvas");
        		canvas.width = video.videoWidth;
        		canvas.height = video.videoHeight;
        		canvas.getContext('2d')
              		.drawImage(video, 0, 0, canvas.width, canvas.height);
              	var formData = new FormData();
				formData.append('file',dataURItoBlob(canvas.toDataURL()));
 
        		$.ajax({
    			    type:'POST',
    			    url: '/admin/storage/videos/'+id+'/thumbnail',
    			    data:formData,
    			    cache:false,
    			    contentType: false,
    			    processData: false,
    			    success:function(data){
						window.location.reload();
    			    },
    			    error: function(data){
    			    	 $("#showContent .alert").show().empty().append(data);
            			$("#showContent .buttons").show();
						$("#showContent .progress").hide();
    			    }
    			});
			});
		}
	}
	$("#showContent .alert").hide();
	$("#showContent .buttons").show();
	$("#showContent .progress").hide();
	$("#showContent").modal('show');
}


$(function(){
	data = JSON.parse(data.replace(/&quot;/g,'"'))
	$('[data-toggle="tooltip"]').tooltip()

	$("#newFolder button.btn-submit").click(function(){
		var name = $("#newFolder input[name=name]").val();
		if (name == ""){return;}
		createFolder(name);
	})
	$("#newFolder").on('show.bs.modal',function(e){
		$("#newFolder input[name=name]").val('');
	}).on('shown.bs.modal',function(e){
		$("#newFolder input[name=name]").focus();
	});


	$("#renameFolder button.btn-submit").click(function(){
		var name = $("#renameFolder input[name=name]").val();
		if (name == ""){return;}
		renameFolder(name);
	});
	$("#renameFolder").on('show.bs.modal',function(e){
		$("#renameFolder input[name=name]").val(folder_name);
	}).on('shown.bs.modal',function(e){
		$("#renameFolder input[name=name]").focus();
	});

	$("input.select-item").click(function(e){
		var type = $(this).data('type');
		var id = $(this).data('id');
		if (type == 'all'){
			$("input.select-item").prop("checked",$(this).prop('checked'));
		}
		$("button[data-target='#deleteItem']").prop('disabled',($("input.select-item:checked[data-type!=all]").length == 0));
	})
	$("button[data-target='#deleteItem']").prop('disabled',($("input.select-item:checked[data-type!=all]").length == 0));

	$("#deleteItem button.btn-submit").click(function(){
		$("input.select-item:checked[data-type!=all]").each(function(){
			nb_todelete++;
			deleteItem($(this).data('type'),$(this).data('id'),function(){
				nb_todelete--;
				if (nb_todelete == 0){
					window.location.reload();
				}
			});
		})
	});
	$("#deleteItem").on('show.bs.modal',function(e){
		$("#deleteItem .modal-title").empty().append('Supprimer '+$("input.select-item:checked[data-type!=all]").length+" élement(s) ?");
	});

	$("#addVideos .progress").hide();
	$("#addVideos .alert").hide();
	$("#addVideos button.btn-submit").click(function(){
		sendVideo()
	});

	$("#addImages .progress").hide();
	$("#addImages .alert").hide();
	$("#addImages button.btn-submit").click(function(){
		sendImage()
	});

	$("#showContent").on('hide.bs.modal',function(){
		$("#showContent .modal-header,#showContent .modal-body,#showContent .modal-footer").empty();
		window.location.hash="#"
	})
	$("a.show-content").click(function(){
		showContent($(this).data('type'), $(this).data('id'))
	});

	if (window.location.hash != "" && window.location.hash != "#"){
		var parts = window.location.hash.replace("#","").split("/");
		showContent(parts[0],parts[1]);
	}
})

