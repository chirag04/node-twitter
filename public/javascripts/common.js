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
	  	$('#unfollow').removeClass('btn-primary').attr('id','follow').html('Follow');;
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
	  	$('#follow').addClass('btn-primary').attr('id','unfollow').html('Unfollow');;
	  } else {
	  	alert("Opps! something went wrong.");
	  }
	});

	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
});

}); 