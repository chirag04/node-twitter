$(document).ready(function() {

var profilename = window.location.pathname.split("/");

if(profilename[1] == "profile") {
	profilename = profilename[2];
	$('.profile-name').html(profilename);
} else {
	profilename = "";
}

$('#unfollow').live('click',function(){
	var request = $.ajax({
	  url: "/unfollow",
	  type: "POST",
	  data: {username : profilename},
	  dataType: "json"
	});

	request.done(function(msg) {
	  if(msg.success == "1") {
	  	$('#unfollow').removeClass('btn-primary').attr('id','follow').html('Follow');
	  } else {
	  	alert("Opps! something went wrong.");
	  }
	});

	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
});

$('#follow').live('click',function(){
	var request = $.ajax({
	  url: "/follow",
	  type: "POST",
	  data: {username : profilename},
	  dataType: "json"
	});

	request.done(function(msg) {
	  if(msg.success == "1") {
	  	$('#follow').addClass('btn-primary').attr('id','unfollow').html('Unfollow');
	  } else {
	  	alert("Opps! something went wrong.");
	  }
	});

	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
});

var modalHTML = '<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
    '<div class="modal-header">'+
    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
    '<h3>Post Message</h3>'+
    '</div>'+
    '<div class="modal-body">'+
    '<p><textarea rows="3" style="width:98%;" id="textmessage"></textarea></p>'+
    '</div>'+
    '<div class="modal-footer">'+
    '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
    '<button class="btn btn-primary" id="submitmessage">Submit</button>'+
    '</div>'+
    '</div>';    

$('#postmessage').live('click',function(){
     if($("#myModal").length === 0) {
  		$('body').append(modalHTML);
	 }
     $('#myModal').modal('show');
});

$('#submitmessage').live('click',function(){
	var request = $.ajax({
	  url: "/submitmessage",
	  type: "POST",
	  data: {message : $('#textmessage').val()},
	  dataType: "json"
	});

	request.done(function(msg) {
	  if(msg.success == "1") {
	  	window.location.reload();
	  } else {
	  	alert("Opps! something went wrong.");
	  }
	});

	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
});

}); 