//global variables (to be moved to scoping function??)
var files;
var homeurl = "/";
var contacturl = "/contact";
var uploadurl = "/upload";
server = "/cowboy";
n = 0;
images_list = ["./images/2.jpg", "./images/3.jpg", "./images/4.jpg", "./images/5.jpg"];
image_titles_list = ["foo", "bar", "baz", "fab"];
images_list_length = images_list.length;
image_titles_list_length = image_titles_list.length;


document.addEventListener("DOMContentLoaded", function(event) { 
	on_page_load();
});
window.onpopstate = function(event) {
	event.preventDefault();
	var popped_url = event.state.url;
//	alert(document.title);
//	alert(state);
//	console.log(state.url);
//	console.log(window.location.pathname);
//	js_routing(window.location.pathname);
	js_routing_hist(popped_url);
}
document.querySelector('#inputfile').addEventListener('change', function(){
	console.log("in query selector");
    files = this.files; 
	console.log(this.files);
	var image=this.files[0];
	var reader = new FileReader();
	reader.onload = function(e) { 
		document.querySelector('#imagetoupload').src = e.target.result;
	};
	reader.readAsDataURL(image);

	//for(var i=0; i<files.length; i++){
	//	upload_image(this.files[i]);
	//	console.log(this.files[i]);
	//}
	//document.querySelector('#info').innerText = 
	//'Name: '+ file.name+
	//', Size: '+file.size +
	//', Type: '+file.type +
	//', Last Modified: ' + file.lastModified;
}, false);

function js_routing(path){
	switch(path) {
		case "/upload": 
			console.log("upload");
			show_upload_form();
			break;
		case "/contact": 
			console.log("contact");
			show_contact_form();
			break;
		default:
			console.log("default. loading home");
			show_image_voting();
	}
}
function js_routing_hist(path){
	switch(path) {
		case "/upload": 
			console.log("upload history");
			show_upload_form_hist();
			break;
		case "/contact": 
			console.log("contact history");
			show_contact_form_hist();
			break;
		default:
			console.log("default. loading home");
			show_image_voting_hist();
	}
}

function on_page_load() {
	// hide all the "below-fold" divs
	hide_below_fold();
	hide_image_voting();
	overlay_on();

	console.log(window.location.pathname);

	// send empty GET to check for cookies
	var xhr = new XMLHttpRequest;
	xhr.open('GET', "/login");
	xhr.onload = function() {
		if (xhr.status === 200) {
			overlay_off();
			//var path = window.location.pathname.substr(1);
			var path = window.location.pathname;
			js_routing(path);
				}
//		else if (xhr.status !== 200) {
//				}
	};
	xhr.send();
}
function overlay_on(){
	document.getElementById("overlay").style.display = "block";
	document.getElementById("sign-up-now-button").style.display = "none";
	document.getElementById("sign-up").style.display = "none";
	document.getElementById("maincontents").classList.add('noscroll');
}
function overlay_off(){
	document.getElementById("overlay").style.display = "none";
	document.getElementById("maincontents").classList.remove('noscroll');
	window.scrollTo(0,0);
}
function hide_below_fold(){
	hide_contact_form();
	hide_upload_form();
}

function sign_in() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/login");
	xhr.onload = function() {
	  	alert(this.response);
		if (xhr.status === 200) {
			//alert('Something went wrong.  Name is now ' + xhr.responseText);
			//alert('Something went wrong.  Name is now ' + xhr.statusText);
			overlay_off();
			var path = window.location.pathname;
			js_routing(path);
		}
		else {
			alert('Request failed.  Returned status of ' + xhr.status);
		}
	};

	//create json data variable from html text input elements 
	//var data = JSON.stringify({login:document.getElementById("login-email").value, password:document.getElementById("login-password").value});
	
	//create FormData variable and append values from html text input elements
	var data = new FormData();
	data.append("login-email", document.getElementById("login-email").value);
	data.append("login-password", document.getElementById("login-password").value)
	xhr.send(data);
}
function sign_up_now() {
	alert('joining...');
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/join");
	xhr.onload = function() {
	  alert(this.response);
		if (xhr.status === 200) {
			alert('Request successful. You will be invited soon...' + xhr.responseText);
			//overlay_off();
				}
		else if (xhr.status !== 200) {
			alert('Request failed.  Returned status of ' + xhr.status);
				}
	};
	var data = JSON.stringify({login:document.getElementById("login-email").value,password:document.getElementById("login-password").value,inviter:document.getElementById("inviter-email").value});
	alert("join waiting list with: " + data);
	xhr.send(data);
	//location.reload(true);
}
function show_signup(){
	document.getElementById("sign-up-now-button").style.display = "block";
	document.getElementById("sign-up").style.display = "block";
	document.getElementById("loginbutton").style.display = "none";
	document.getElementById("show-signup-button").style.display = "none";
	document.getElementById("no-account-text").style.display = "none";
}
function ajaxcallback(serverrespos) {
	var server_response = JSON.parse(this.response);
	alert(server_response);
	//var myarray = JSON.parse(this.response);
	//alert(myarray);
	alert(this.response);
	//images_list = JSON.parse(this.response);
}
function make_ajax_call(URL) {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', URL);
	xhr.onload = function(e) {
		alert(this.response);
	};
	xhr.send("foo");
}
function send_message() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', server);
	xhr.onload = function() {
	  alert(this.response);
	  alert("thank you, message received");
	};
	var data = JSON.stringify({name:document.getElementById("text-name").value,email:document.getElementById("text-email").value,message:document.getElementById("textarea-message").value});
	alert(data);
	document.getElementById("contactform").reset();
	hide_contact_form();
	show_image_voting();
	xhr.send(data);
//			alert(document.getElementById("text-name").value);
//			alert(document.getElementById("text-email").value);
//			alert(document.getElementById("textarea-message").value);
}	

function show_image_voting(){
	//history.pushState({url:homeurl.substr(1)}, null, homeurl);
	history.pushState({url:homeurl}, null, homeurl);
	document.getElementById("image-voting").style.display = "block";
	hide_below_fold();
}
function show_image_voting_hist(){
	//history.pushState({url:homeurl.substr(1)}, null, homeurl);
	document.getElementById("image-voting").style.display = "block";
	hide_upload_form();
	hide_contact_form();
	hide_below_fold();
}
function hide_image_voting(){
	document.getElementById("image-voting").style.display = "none";
}
function nextimage(clickedbuttonid) {
	alert(n + '\n' + clickedbuttonid + '\n' + document.getElementById("imagetitle").innerHTML);
	document.getElementById("currentimage").src = images_list[n % images_list_length];
	document.getElementById("imagetitle").innerHTML = image_titles_list[n % image_titles_list_length];
	n = n + 1;
	//make_ajax_call(server);
	//function to simply update images_list with this.response. 
}

function show_contact_form(){
	//history.pushState({url:contacturl.substr(1)}, null, contacturl);
	history.pushState({url:contacturl}, null, contacturl);
	document.getElementById("show-upload-button").style.display = "none";
	document.getElementById("contact-form-div").style.display = "block";
	document.getElementById("show-contact-button").style.display = "none";
	document.getElementById("send-message-button-div").style.display = "block";
	document.getElementById("show-upload-button-div").style.display = "none";
	hide_upload_form();
	hide_image_voting();
}
function show_contact_form_hist(){
	//history.pushState({url:contacturl.substr(1)}, null, contacturl);
	document.getElementById("show-upload-button").style.display = "none";
	document.getElementById("contact-form-div").style.display = "block";
	document.getElementById("show-contact-button").style.display = "none";
	document.getElementById("send-message-button-div").style.display = "block";
	document.getElementById("show-upload-button-div").style.display = "none";
	hide_upload_form();
	hide_image_voting();
}
function hide_contact_form(){
	document.getElementById("contact-form-div").style.display = "none";
	document.getElementById("show-contact-button").style.display = "block";
	document.getElementById("send-message-button-div").style.display = "none";
	document.getElementById("show-upload-button-div").style.display = "block";
	clear_contact_form();
}
function clear_contact_form(){
	document.getElementById("text-name").value="";
	document.getElementById("text-email").value="";
	document.getElementById("textarea-message").value="";

}

function show_upload_form(){
	//history.pushState({url: uploadurl.substr(1)}, null, uploadurl);
	history.pushState({url: uploadurl}, null, uploadurl);
	hide_image_voting();
	hide_contact_form();
	document.getElementById("show-contact-button").style.display = "none";
	document.getElementById("imagetoupload").src = "";
	document.getElementById("upload-form-div").style.display = "block";
	document.getElementById("show-upload-button").style.display = "none";
	document.getElementById("upload-image-button-div").style.display = "block";
	document.getElementById("imagetoupload").style.display = "block";
}
function show_upload_form_hist(){
	hide_image_voting();
	hide_contact_form();
	document.getElementById("show-contact-button").style.display = "none";
	document.getElementById("imagetoupload").src = "";
	document.getElementById("upload-form-div").style.display = "block";
	document.getElementById("show-upload-button").style.display = "none";
	document.getElementById("upload-image-button-div").style.display = "block";
	document.getElementById("imagetoupload").style.display = "block";
}
function hide_upload_form(){
	document.getElementById("upload-form-div").style.display = "none";
	document.getElementById("show-upload-button").style.display = "block";
	document.getElementById("upload-image-button-div").style.display = "none";
	document.getElementById("imagetoupload").style.display = "none";
	clear_upload_form();
}
function clear_upload_form(){
	document.getElementById("text-adj-1").value="";
	document.getElementById("text-adj-2").value="";
	document.getElementById("inputfile").value="";
}
function upload_image() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/uploadhandler");
	xhr.onload = function() {
	  alert(this.response);
		if (xhr.status === 200) {
			alert('upload successful');
			overlay_off();
		}
		else {
//			alert('Something went wrong. status text is: ' + xhr.responseText);
//			alert('Something went wrong. response text is ' + xhr.statusText);
			alert('upload failed. try again.' );
		}
	};
	//json data - no longer used
	//var data = JSON.stringify({name:document.getElementById("text-name").value,email:document.getElementById("text-email").value,message:document.getElementById("textarea-message").value});
	var data = new FormData();
	data.append("inputfile", files[0]);
	data.append("adj1", document.getElementById("text-adj-1").value);
	data.append("adj2", document.getElementById("text-adj-2").value);
	clear_upload_form();
	hide_upload_form();
	show_image_voting();
	xhr.send(data);
}	
