// todo
//todo - make vars for all html elements used in js via getElementById
//todo - consider separate req (and server route) to check for login status. route for actual login/pageload could already send image list. 
//todo - consider using session storage, to retain vars after page refresh

//global variables (to be moved to new scoping function??)
var files;
var homeurl = "/";
var contacturl = "/contact";
var uploadurl = "/upload";
var server = "/cowboy";

var voterecord = [];
var votedimages = [];

//clicking on next: 
//	when it is a votable image (identified by non existence in the votedimages list): show the next item in the votable list, and register the vote. 
//	when it is a non votable image (identified by existence in the votedimages list): show the next item in the votable list, do not register the vote

//clicking on a vote button:
//	when it is a votable image (identified by non existence in the votedimages list): register the vote, and show the next item in the votable list
//	when it is a non votable image: vote buttons are deactivated. 

image_counter = 0; //start at 0, inc each time a new image is voted on, not for revisited images. 

images_src_list = ["https://drive.google.com/host/17W37pVLO5ax12pQzCHfnSe-gmdHpTnbl/", "https://drive.google.com/file/d/1lNiFftO1OCun9Yx0kqqj9jT47E0ocytL/view", "./images/3.jpg", "./images/4.jpg", "./images/5.jpg"];
images_id_list = ["111", "222", "333", "444", "555"];
image_titles_list = ["ddd", "foo", "bar", "baz", "fab"];
images_src_list_length = images_src_list.length;
image_titles_list_length = image_titles_list.length;


// event listeners - domcontentloaded, popstate.
document.addEventListener("DOMContentLoaded", function(event) { 
	on_page_load();
});
window.onpopstate = function(event) {
	event.preventDefault();
	if (event.state === null) {
		//if the user has clicked the back button all the way to the start where there's no history and hence event.state is null
		//window.location.href="https://192.168.43.220:8765"; //reload the page to bring user back to same place. this is suboptimal. approach below works much better. 
		history.go(1); //just keep on same page if user keeps clicking back button, since there's no back. 
	} else {
		var popped_url = event.state.url;
		js_routing_hist(popped_url);
	}
//	js_routing(window.location.pathname);
}

// js routing
function js_routing(path){
	switch(path) {
		case "/upload": 
			//console.log("upload");
			show_upload_form();
			break;
		case "/contact": 
			//console.log("contact");
			show_contact_form();
			break;
		//case "/images": 
			//console.log("contact history");
			//get image Id from the url form /images/xxxx
			//send req to server. receive array/list in response. 
			//key difference between this route in js_routing/hist - load from server vs load from existing array. 
			//load_image_n(current_n);
			//break;
		default:
			//console.log("default. loading home");
			show_image_voting();
	}
}
function js_routing_hist(path){
	switch(path) {
		case "/upload": 
			//console.log("upload history");
			show_upload_form_hist();
			break;
		case "/contact": 
			//console.log("contact history");
			show_contact_form_hist();
			break;
		// for matching images. the path will be the last segment (with image id)
		case (path.match(/[0-9]+$/) || {}).input: 
			//console.log("contact history");
			show_image_voting_hist();
			break;
		default:
			//console.log("default. loading home");
			 window.location.href="https://192.168.43.220:8765";
			//show_image_voting_histndow.location.href=\""();
	}
}

// page structure
function on_page_load() {
	// hide all the "below-fold" divs
	hide_below_fold();
	hide_image_voting();
	overlay_on();

	//console.log(window.location.pathname);

	// send empty GET to check for cookies
	var xhr = new XMLHttpRequest;
	xhr.open('GET', "/login");
	xhr.onload = function() {
		if (xhr.status === 200) {
			overlay_off();
			//var path = window.location.pathname.substr(1);
			//call the js_routing fun to load the path submitted in the address bar
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
//	document.getElementById("password_reset").style.display = "none";
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

// login, pw, account related
function clear_login_form(){
	document.getElementById("login-email").value="";
	document.getElementById("login-password").value="";
	document.getElementById("inviter-email").value="";
}
function sign_in() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/login");
	xhr.onload = function() {
	  	alert(this.response);
		if (xhr.status === 200) {
			//alert('Something went wrong.  Name is now ' + xhr.responseText);
			//alert('Something went wrong.  Name is now ' + xhr.statusText);

			//send new req to server to get images list. 

			overlay_off();
			var path = window.location.pathname;
			js_routing(path);
		}
		else {
			clear_login_form();
			alert('Request failed.  Returned status of ' + xhr.status);
		}
	};

	//create json data variable from html text input elements 
	//var data = JSON.stringify({login:document.getElementById("login-email").value, password:document.getElementById("login-password").value});
	
	//create FormData variable and append values from html text input elements
	var data = new FormData();
	data.append("login-email", document.getElementById("login-email").value);
	data.append("login-password", document.getElementById("login-password").value);
	xhr.send(data);
}
function sign_up_now() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/join/new");
	xhr.onload = function() {
	  alert(this.response);
	  clear_login_form();
		if (xhr.status === 200) {
			alert('Request successful. You will be invited soon...' + xhr.responseText);
			//overlay_off();
				}
		else if (xhr.status !== 200) {
			alert('Request failed.  Returned status of ' + xhr.status);
				}
	};
	var data = new FormData();
	data.append("login-email", document.getElementById("login-email").value);
	data.append("login-password", document.getElementById("login-password").value);
	data.append("inviter-email", document.getElementById("inviter-email").value);
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

function forgot_pw() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/resetpassword/forgot");
	xhr.onload = function() {
	  	alert(this.response);
		if (xhr.status === 200) {
			//alert('Something went wrong.  Name is now ' + xhr.responseText);
			//alert('Something went wrong.  Name is now ' + xhr.statusText);
//			overlay_off();
//			var path = window.location.pathname;
//			js_routing(path);
			alert("request received successfully. check your email");
			clear_login_form();
//			document.getElementById("password_reset").style.display = "block";
//			document.getElementById("entry").style.display = "none";
			
		}
		else {
			alert('Request failed.  Returned status of ' + xhr.status);
			clear_login_form();
		}
	};

	//create FormData variable and append values from html text input elements
	var data = new FormData();
	data.append("login-email", document.getElementById("login-email").value);
	data.append("login-password", document.getElementById("login-password").value)
	xhr.send(data);
}

// image, voting related
function show_image_voting(){
	document.getElementById("image-voting").style.display = "block";
	load_image_n(image_counter); // start at 0
	hide_below_fold();
}
function show_image_voting_hist(){
	document.getElementById("image-voting").style.display = "block";
	hide_upload_form();
	hide_contact_form();
	hide_below_fold();
	
	//load up corresponding image from array
	load_image_hist();
}
function hide_image_voting(){
	document.getElementById("image-voting").style.display = "none";
}

function load_image_n(n) {
	document.getElementById("currentimage").src = images_src_list[n];
	document.getElementById("imagetitle").innerHTML = image_titles_list[n];
	imagesbuttonsactivation(n);
	createimagehistory(n);
}
function load_image_hist() {
	//get serial number of that image in the array
	current_n = get_image_serial();
	imagesbuttonsactivation(current_n);

	document.getElementById("currentimage").src = images_src_list[current_n];
	document.getElementById("imagetitle").innerHTML = image_titles_list[current_n];

	//createimagehistory(n);
	//historical views don't push state to history because that leads to an infinite loop.
}

function nextimage(clickedbuttonid) {
	// img1 vote -> img 2 vote -> img 3 vote -> back -> back -> contact page -> back (to img 1) -> then click next
	// to do - click skip/next button on already voted image - take to next (voted) image or next image yet to be voted?
	// consider - checking (similar to imagesbuttonsactivation) before taking action on next click ??
	//
	// list of 10 images. when n is 2, update 6-10, when n is 7, update 1-5. 
	//
	// updating includes sending the votes for those images to the server (create new array to store vote results)
	// create server module to process votes and another to send new images. 
	// function to check for value of n and send votes to server and get/process/update new images
	//make_ajax_call(server);
	//function to simply update images_src_list with this.response. 

	current_n = get_image_serial();
	recordvote(current_n, clickedbuttonid);

	load_image_n(image_counter);
	}

function createimagehistory(n){
	if (n == 0) {
		history.pushState({url:homeurl+"images/"+images_id_list[n]}, null, homeurl+"images/"+images_id_list[n]);
	} else {
		history.pushState({url: images_id_list[n]}, null, images_id_list[n]);
	}
}
function recordvote(current_n, clickedbuttonid){
	if (current_n == image_counter) {
		//voterecord[n] = clickedbuttonid;
		voterecord[image_counter] = clickedbuttonid;
		alert(voterecord);
		image_counter = image_counter + 1;
		}
}
function imagesbuttonsactivation(n){
	if (n < image_counter) {
		// to do: try using getelementbyclass instead of id
		document.getElementById("button1").disabled = true;
		document.getElementById("button2").disabled = true;
		//document.getElementById("button3").disabled = true;
	} else {
		document.getElementById("button1").disabled = false;
		document.getElementById("button2").disabled = false;
		//document.getElementById("button3").disabled = false;
	}
}
function get_image_id_from_url(){
	//get image Id from the url form /images/xxxx
	patharray = window.location.pathname.split("/");
	if (patharray[1] == "images"){
		return patharray[2];
	}
}
function get_image_serial(){
	id = get_image_id_from_url();
	for (var i = 0; i < images_id_list.length; i++) {
		if (id == images_id_list[i]){
			return i;
		}
	}
}

// send message
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
function send_message() {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', "/messagehandler");
	xhr.onload = function() {
		if (xhr.status === 200) {
			//document.getElementById("message-content").innerHTML=this.response;
			//alert(this.response);
			window.history.go(-1);
			//window.history.go(+1);
		}
		else {
			alert('Message sending failed.  Returned status of ' + xhr.status);
			alert('Message sending failed.  Returned status of ' + xhr.responseText);
		}

	};
	var data = new FormData();
	data.append("sender-name", document.getElementById("text-name").value);
	data.append("sender-email", document.getElementById("text-email").value)
	//the line below gets the content from a text box using .value
	//data.append("message-content", document.getElementById("textarea-message").value)
	//the line below gets the content from a adjustable content span using .innerhtml
	//the advantage of using a span is its size adjusts automatically to given input.
	//but a text box needs jquery for its size to adjust to input
	data.append("message-content", document.getElementById("textarea-message").innerHTML);

	document.getElementById("contactform").reset();
	hide_contact_form();
	//show_image_voting();
	xhr.send(data);
}	

// upload image
function show_upload_form(){
	// send empty GET to check for cookies
	var xhr = new XMLHttpRequest;
	xhr.open('GET', "/login");
	xhr.onload = function() {
		if (xhr.status === 200) {
//			var path = window.location.pathname;
//			js_routing(path);
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
		else if (xhr.status !== 200) {
			overlay_on();
				}
	};
	xhr.send();
}
function show_upload_form_hist(){
	// send empty GET to check for cookies
	var xhr = new XMLHttpRequest;
	xhr.open('GET', "/login");
	xhr.onload = function() {
		if (xhr.status === 200) {
//			var path = window.location.pathname;
//			js_routing(path);
//			history.pushState({url: uploadurl}, null, uploadurl);
			hide_image_voting();
			hide_contact_form();
			document.getElementById("show-contact-button").style.display = "none";
			document.getElementById("imagetoupload").src = "";
			document.getElementById("upload-form-div").style.display = "block";
			document.getElementById("show-upload-button").style.display = "none";
			document.getElementById("upload-image-button-div").style.display = "block";
			document.getElementById("imagetoupload").style.display = "block";
				}
		else if (xhr.status !== 200) {
			overlay_on();
				}
	};
	xhr.send();
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
	// send empty GET to /login to check for session cookie before uploading  
	// alternatively, check session status serverside only: current approach
//	var xhr = new XMLHttpRequest;
//	xhr.open('GET', "/login");
//	xhr.onload = function() {
//		if (xhr.status === 200) {
			var xhr1 = new XMLHttpRequest;
			xhr1.open('POST', "/uploadhandler");
			xhr1.onload = function() {
			  alert(this.response);
				if (xhr1.status === 200) {
					alert('upload successful');
					window.history.go(-1);
//					clear_upload_form();
//					hide_upload_form();
//					show_image_voting();
//					overlay_off();
				}
				else {
					alert('upload failed. try again.' );
					if (xhr1.status === 400) {
						alert('your session has expired. please log in again');
						clear_login_form();
						overlay_on();
					}
				}
			};
			var data = new FormData();
			data.append("inputfile", files[0]);
			data.append("adj1", document.getElementById("text-adj-1").value);
			data.append("adj2", document.getElementById("text-adj-2").value);
			xhr1.send(data);
//			}
//		else if (xhr.status !== 200) {
//			alert('your session has expired. please log in again');
//			clear_login_form();
//			overlay_on();
//				}
//	};
//	xhr.send();
}	

document.querySelector('#inputfile').addEventListener('change', function(){
	//console.log("in query selector");
    files = this.files; 
	//console.log(this.files);
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

// show faqs
function show_faqs_pre_login(){
	history.pushState({url:window.location.pathname}, null, window.location.pathname);
	window.location.replace("faqs");
}
//function show_faqs_post_login(){
//	// INCOMPLETE FUNCTION. WIP. 
//	  var xhr = new XMLHttpRequest;
//	  xhr.onload = function() {
//		if (xhr.status === 200) {
//			var faqcontent = document.createElement('p');
//			faqcontent.innerHTML = xhr.responseText;
//			document.getElementById("faqs-div").appendChild(faqcontent);
//			//document.getElementById("faqs-div").text = xhr.responseText;
//			//doing the above leads to an effective page load - the on page load func is called and executed. 
//			document.getElementById("show-contact-button").style.display = "none";
//			document.getElementById("upload-form-div").style.display = "none";
//			document.getElementById("show-upload-button").style.display = "none";
//			document.getElementById("upload-image-button-div").style.display = "none";
//			document.getElementById("imagetoupload").style.display = "none";
//			document.getElementById("image-voting").style.display = "none";
//			document.getElementById("faqs-div").style.display = "block";
//		  }
//	}
//	xhr.open("GET", "/faqs #faqs-content"); 
//	xhr.send();
//	alert("xhr sent");
//}

// dummy funs
function ajaxcallback(serverrespos) {
	var server_response = JSON.parse(this.response);
	alert(server_response);
	//var myarray = JSON.parse(this.response);
	//alert(myarray);
	alert(this.response);
	//images_src_list = JSON.parse(this.response);
}
function make_ajax_call(URL) {
	var xhr = new XMLHttpRequest;
	xhr.open('POST', URL);
	xhr.onload = function(e) {
		alert(this.response);
	};
	xhr.send("foo");
}
function dummy(){
	alert("dummy");
}

