function getFormData(){
	var data = {};
	data.title = $("#inputTitle").val();
	data.text = $("#inputText").val();
	data.comment = $("#inputComment").prop("checked")==true?true:false;
	data.data = $("#inputData:checked").val();
	console.log(data)
	return data;
}
function setFormData(data){
	$("#inputTitle").val(data.title);
	$("#inputText").val(data.text);
	$("#inputComment").prop("checked",data.comment);
	$("#inputData[value="+data.data+"]").prop("checked",true);
	setInputData(data.data)
}
function setInputData(type){
  	if (type == "folder"){
	  	$("#dataFolder").show();
	  	$("#dataFiles").hide();
  	} else {
	  	$("#dataFiles").show();
  		$("#dataFolder").hide();
  	}
}

$(function(){
	sessionStorage.setItem("from","/admin/news/new");
  	$('[data-toggle="popover"]').popover({html:true});

  	$("#dataFolder").hide();

  	$(".input-data").click(function(){
  		setInputData($(this).val());
  	})
  	
	$(".form-change").change(function(){
		console.log("Save form")
		sessionStorage.setItem("news",JSON.stringify(getFormData()));
	});

  	if (sessionStorage.getItem("news") !== null){
  		setFormData(JSON.parse(sessionStorage.getItem("news")))
  	}
})