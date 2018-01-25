// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add views
var view1 = myApp.addView('#view-1');
var view2 = myApp.addView('#view-2', {
    // Because we use fixed-through navbar we can enable dynamic navbar
	dynamicNavbar: true,
	domCache: true //enable inline pages
});
var view3 = myApp.addView('#view-3');
var view4 = myApp.addView('#view-4', {
	// Because we use fixed-through navbar we can enable dynamic navbar
	dynamicNavbar: true,
	domCache: true 
});

// Global variables
var sourcesForView;
var articles;
var userId;
var kylesStoriesForWiew = '';

// Asynchronous method to Download the sources
$$.getJSON( "https://newsapi.org/v1/sources?language=en", function( data ) {
	
	var sources = data.sources;
	sourcesForView = '<div class="list-block"><ul>';
	for (var i = 0; i < sources.length; i++) {
		var name = sources[i].name
		sourcesForView += '<li><a href="news.html?id=' + sources[i].id + '" class="item-link item-content">' +
												'<div class="item-inner">' +
												'<div class="item-title">' + name + '</div>' +
												'</div></a></li>'
	}
	sourcesForView += '</ul></div>';
	
});

// Asynchronous method to Download the stories from Kyle's API
$$.getJSON( "http://52.48.79.163/db.php?type=top10stories", function( data ) {
	
	var kylesstories = data.news.story;

	for (var i = 0; i < kylesstories.length; i++){
		kylesStoriesForWiew += '<h1>' + kylesstories[i] + '</h1>';
	}
	
});

// JS to load articles for a specific source onto the page
myApp.onPageInit('news', function(page){
	var source = $$.parseUrlQuery(page.url).id;

	$$.getJSON('https://newsapi.org/v1/articles?source=' + source + '&apiKey=b14c8564eacf424d9736a7d13cd7f64d', function( data ) {

		articles = data.articles;

		var articlesForView = '<div class="list-block"><ul>';
		
		for (var i = 0; i < articles.length; i++) {
			var title = articles[i].title;
			var url = articles[i].url;
			articlesForView += '<li><a href="news-detail.html?ind=' + i + '" class="item-link item-content">' +
												'<div class="item-inner">' +
												'<div class="item-title">' + title + '</div>' +
												'</div></a></li>';
		}
		
		// This block defines a link to the custom JSON
		// Type 1 refers to custom JSON for a specific story
		articlesForView += '</ul></div>';
		articlesForView += '<div class="list-block"><ul>';
		articlesForView += '<li><a href="myJSON.html?ind=' + source + '&type=2" class="item-link item-content">' +
							'<div class="item-inner">' +
							'<div class="item-title">GET JSON</div>' +
							'</div></a></li></ul></div>';

		// This is where the content is included onto the page
		document.getElementById('content').innerHTML = articlesForView;

	});

});

// JS to load specific article onto the page
myApp.onPageInit('news-detail', function(page){
	
	var article = $$.parseUrlQuery(page.url).ind;
	var contentForView = "";

	contentForView += '<h1>' + articles[article].title + '</h1>';
	contentForView += '<p> By: ' + articles[article].author + '</p>';
	contentForView += '<p> Date: ' + articles[article].publishedAt + '</p>'
	contentForView += '<p>' + articles[article].description + '</p>';
	contentForView += '<img src="' + articles[article].urlToImage + '" height="300" width="300">';

	// This block defines a link to the custom JSON
	// Type 1 refers to custom JSON for a specific story
	contentForView += '<div class="list-block"><ul>';
	contentForView += '<li><a href="myJSON.html?ind=' + article + '&type=1" class="item-link item-content">' +
						'<div class="item-inner">' +
						'<div class="item-title">GET JSON</div>' +
						'</div></a></li></ul></div>';
	
	// This is where the content is included onto the page
	document.getElementById('details').innerHTML = contentForView;	

});

// JS to build custom JSON with information from JSON previously downloaded
// from NewsAPI.
// Type 1 refers to custom JSON for a specific story
// Type 2 refers to custom JSON for a specific source 
myApp.onPageInit('myJSON', function(page){

	var variables = $$.parseUrlQuery(page.url);
	var ind = variables.ind;
	var type =  variables.type;
	var customJSON = '{';
	
	if (type == 1){ // Specific Story
		customJSON += '"SUPER-TITLE":"' + articles[ind].title + '",';
		customJSON += '"SUPER-AUTHOR":"' + articles[ind].author + '",';
		customJSON += '"SUPER-DATE":"' + articles[ind].publishedAt + '",';
		customJSON += '"SUPER-DESCRIPTION":"' + articles[ind].description + '",';
		customJSON += '"SUPER-LINK-TO-PICTURE":"' + articles[ind].urlToImage + '"';
	
	}
	else if (type == 2){ // Specific Source
		customJSON += '"SUPER-SOURCE": "' + ind + '",';
		customJSON += '"SUPER-NEWS": "[';

		for (var i = 0; i < articles.length; i++) {
			customJSON += '{';
			customJSON += '"SUPER-TITLE":"' + articles[i].title + '",';
			customJSON += '"SUPER-AUTHOR":"' + articles[i].author + '",';
			customJSON += '"SUPER-DATE":"' + articles[i].publishedAt + '",';
			customJSON += '"SUPER-DESCRIPTION":"' + articles[i].description + '",';
			customJSON += '"SUPER-LINK-TO-PICTURE":"' + articles[i].urlToImage + '"';
			
			if (i == articles.length - 1 ){
				customJSON += '}';
			}
			else {
				customJSON += '},';
			}
			
		}

		customJSON += ']"';

	}

	// Just to make it even more personal
	customJSON += ', "SUPER-CODER":"AMILCAR" }';
	
	// Loading the JSON onto the page
	document.getElementById('customJSON').innerHTML = customJSON;
});

// JS to load the news the user has uploaded to Kyle's API
myApp.onPageInit('myuploads', function (page) {  

	$$.get('http://52.48.79.163/db.php?type=getmystories&id=' + userId, function (data) {
		document.getElementById('externals').innerHTML = data;
	});     

});

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
	console.log('statusChangeCallback');
	console.log(response);

	// The response object is returned with a status field that lets the
	// app know the current login status of the person.
	// Full docs on the response object can be found in the documentation
	// for FB.getLoginStatus().
	if (response.status === 'connected') {
		// Logged into your app and Facebook.
		testAPI();
	} else {
		// The person is not logged into your app or we are unable to tell.
		document.getElementById('status').innerHTML = 'Please log ' +
		'into this app. <br>' + '';
		
		document.getElementById('sources').innerHTML = 'Please log ' +
		'into this app.';

		document.getElementById('kylesnews').innerHTML = 'Please log ' +
		'into this app.';

		$$('#storyForm').hide();
		$$('#alert').show();

		
	}
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
	FB.getLoginStatus(function(response) {
  	statusChangeCallback(response);
	});
}

window.fbAsyncInit = function() {
	FB.init({
		appId      : '151003315636045',
		cookie     : true,  // enable cookies to allow the server to access
												// the session
		xfbml      : true,  // parse social plugins on this page
		version    : 'v2.10' // use graph api version 2.8
	});

	// Now that we've initialized the JavaScript SDK, we call
	// FB.getLoginStatus().  This function gets the state of the
	// person visiting this page and can return one of three states to
	// the callback you provide.  They can be:
	//
	// 1. Logged into your app ('connected')
	// 2. Logged into Facebook, but not your app ('not_authorized')
	// 3. Not logged into Facebook and can't tell if they are logged into
	//    your app or not.
	//
	// These three cases are handled in the callback function.
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});

};

// Load the SDK asynchronously
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));

// Heree is where we define what to do when the FB login is succesfull.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');

	FB.api('/me', function(response) {
		document.getElementById('status').innerHTML =
		'Thanks for logging in, ' + response.name + '!<br> <a href="javascript:refresh();" class="button">Refresh News</a> <br>'+
		'<a href="javascript:logoutPerson();" class="button">Get me out of here!</a>';

		// Load sources
		document.getElementById('sources').innerHTML = sourcesForView;

		// Load news from Kyle's API
		document.getElementById('kylesnews').innerHTML = kylesStoriesForWiew;

		// Display form to upload news to Kyle's API
		$$('#storyForm').show();
		$$('#alert').hide();

		userId = response.id;

	});
}

// Here is where we define what to do when the FB logout is performed
function logoutPerson(){
	FB.logout(function(response) {
		refresh();
		// Person is now logged out
	});
}

function refresh(){
	location.reload();
	
}

// Retrieve data from the form to be uploaded onto Kyle's API
$$('.form-to-story').on('click', function(){
	
	var formData = myApp.formToData('#story');
	var toSend = encodeURI("http://52.48.79.163/db.php?type=newstory&data=" + formData.description + "&id=" + userId);
	
	$$.get(toSend, function (data) {
		alert("Your article has been submited to the server!");
		document.getElementById('story').reset();
	  });

});

