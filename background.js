var COOKIES = [];
var UA = window.navigator.userAgent;
var me_id = '';
var site = 'https://www.facebook.com';

chrome.browserAction.onClicked.addListener(
		function(tab) {
		chrome.tabs.create({
				'url': chrome.extension.getURL("friendlist.html")
			}
		);
		}
		);

chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
			if (request.type == "addItem") {
				getFriendList();
				sendResponse({farewell: "goodbye"});
			} else if ( request.type == "getSavedFriendList" ) {
				chrome.storage.local.get('friendlist_ul', function(items) {
					sendResponse(items);
				});
			} else if ( request.type == "clearFriendList" ) {
				chrome.storage.local.remove('friendlist_ul', function() {
					sendResponse(true);
				});
			} else if ( request.type == "getUserWall" ) {
				getUserWall(request.id, request.page);
				sendResponse(true);
			} else if ( request.type == "getLikes" ) {
				getInitialLikes();
				sendResponse(true);
			} else if ( request.type == "getTicks" ) {
				getInitialTicks();
				sendResponse(true);
			}
			return true;//http://stackoverflow.com/questions/27823740/chrome-extension-message-passing-between-content-and-background-not-working
		});

// http://stackoverflow.com/questions/10334909/associate-a-custom-user-agent-to-a-specific-google-chrome-page-tab/10339902#10339902
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        // Replace the User-Agent header
        var headers = info.requestHeaders;
        headers.forEach(function(header, i) {
            if (header.name.toLowerCase() == 'user-agent') { 
                header.value = UA;
            }
        });  
        return {requestHeaders: headers};
    },
    // Request filter
    {
        // Modify the headers for these pages
        urls: [
            "https://www.facebook.com/*"
        ],
        // In the main window and frames
        types: ["main_frame", "sub_frame"]
    },
    ["blocking", "requestHeaders"]
);

function getMeId() {
	if ( !me_id ) {
		r1 = new XMLHttpRequest();
		r1.onload = function() {
			re = /USER_ID\":\"(\d+)\"/;
			res = re.exec(this.responseText);
			me_id = res[1];
		};
		r1.open('GET', 'https://www.facebook.com/me', false);
		r1.send();
	}
}

function buildFriendWallDataQS(id, page) {
	data = {"profile_id":parseInt(id),
		"start":0,
		"end":1477983599,
		"query_type":36,
		"sk":"timeline",
		"lst":me_id+':'+id+':'+String(Math.round(Date.now()/1000)),
		"buffer":50,
		"current_scrubber_key":"recent",
		"page_index":parseInt(page),
		"require_click":false,
		"section_container_id":"u_jsonp_42_g",
		"section_pagelet_id":"pagelet_timeline_recent",
		"unit_container_id":"u_jsonp_42_f",
		"showing_esc":false,
		"adjust_buffer":false,
		"tipld":{
			"sc":3*parseInt(page),// magic number, not accurate, needs tweaking
			"vc":6*parseInt(page)
		},
		"num_visible_units":6*parseInt(page),
		"remove_dupes":true
	};
	return JSON.stringify(data);
}

function buildUrl(url, parameters){
	var qs = "";
	for(var key in parameters) {
		var value = parameters[key];
		qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
	}
	if (qs.length > 0){
		qs = qs.substring(0, qs.length-1); //chop off last "&"
		url = url + "?" + qs;
	}
	return url;
}
function getUserWall(id, page) {
	getMeId();
	var endpoint = '/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet';
	var params = {
		dpr:1,
		ajaxpipe:1,
		//ajaxpipe_token:AXhTS1yuV8BV9ueh,
		no_script_path:1,
		data: buildFriendWallDataQS(id, page?page:1),
		__user:parseInt(me_id),
		__a:1,
		__dyn: '',
		//__af:o,
		//__req:jsonp_43,
		__be:-1,
		//__pc:PHASED%3ADEFAULT,
		//__rev:2646857,
		//__srp_t:1477551480,
		//__adt:43
	};
	var qs = buildUrl('',params);
	r1 = new XMLHttpRequest();
	r1.onload = function() {
		chrome.runtime.sendMessage({type: "appendUserWall", id: id, html: this.responseText}, function(response) {
		});
	};
	r1.open('GET', site+endpoint+qs, true);
	r1.send();
}

function buildDataQS(me_id, app_id='', magic1='', cursor='', tab_key) {
	data = {
		'collection_token': me_id+':'+app_id+':'+magic1,//magic number
		'cursor': btoa('0:not_structured:'+cursor),
		"tab_key": tab_key,
		'profile_id': parseInt(me_id),//parseInt is significant
		//"q":"",//not required
		"overview":false,
		//lst?
		"ftid":null,
		"order":null,
		"sk":tab_key,
		"importer_state":null
	};
	return encodeURIComponent(JSON.stringify(data));
}
function getFriendList(cursor) {
	getMeId();
	var endpoint = '/ajax/pagelet/generic.php/AllFriendsAppCollectionPagelet';
	var qs = '?dpr=1&data='+buildDataQS(me_id, '2356318349', '2', cursor, 'friends')+'&__user='+me_id+'&__a=1&__dyn=';//__a=1 is significant
	//getCookies();
	r1 = new XMLHttpRequest();
	r1.onload = function() {
		res_obj = JSON.parse(this.responseText.substr(9));
		chrome.runtime.sendMessage({type: "appendFriendList", payload: res_obj.payload}, function(response) {
			if ( response.cursor ) {
				getFriendList(parseInt(response.cursor));
			} else if ( response.friendlist_ul ) {
				chrome.storage.local.set({'friendlist_ul': response.friendlist_ul }, function() {
					console.log("Done saving friendlist_ul");
					chrome.storage.local.get('friendlist_ul', function(items) {
						console.log(items);
					});
				});
			}
		});
	};
	r1.open('GET', site+endpoint+qs, true);
	//r1.setRequestHeader('user-agent', UA);
	r1.send();

}

function getInitialLikes() {
	r1 = new XMLHttpRequest();
	r1.open('GET', 'https://www.facebook.com/me/likes', false);
	r1.send();

	// First <ul> is contained in this response
	raw_el = $(r1.responseText);
	// the code elem's id might not be u_0_4l, but search for something like this in raw_el:
	// <div class="hidden_elem"><code id="u_0_4l"><!-- <ul class="uiList _153e _5k35 _620 _509- _4ki"><li class="_5rz _5k3a _5rz3 _153f"><div class="_3owb">
	likes_ul_str = raw_el.find('code#u_0_4l')[0].innerHTML.slice(5, -4);
	likes_ul = $(likes_ul_str);
	chrome.runtime.sendMessage({type: "appendLikesList", payload: likes_ul[0].outerHTML}, function(response) {
		if ( response.cursor ) {
			getLikes(response.cursor);
		}
	});
}

function getLikes(cursor) {
	getMeId();
	var endpoint = '/ajax/pagelet/generic.php/LikesWithFollowCollectionPagelet';
	var qs = '?dpr=1&data='+buildDataQS(me_id, '2409997254', '96', cursor, "likes")+'&__user='+me_id+'&__a=1&__dyn=';//__a=1 is significant
	//getCookies();
	r1 = new XMLHttpRequest();
	r1.onload = function() {
		res_obj = JSON.parse(this.responseText.substr(9));
		chrome.runtime.sendMessage({type: "appendLikesList", payload: res_obj.payload}, function(response) {
			if ( response.cursor ) {
				getLikes(response.cursor);
			} else if ( response.stop ) {
				return;
				/*
				chrome.storage.local.set({'friendlist_ul': response.friendlist_ul }, function() {
					console.log("Done saving friendlist_ul");
					chrome.storage.local.get('friendlist_ul', function(items) {
						console.log(items);
					});
				});*/
			}
		});
	};
	r1.open('GET', site+endpoint+qs, true);
	//r1.setRequestHeader('user-agent', UA);
	r1.send();
}

function getInitialTicks() {
	r1 = new XMLHttpRequest();
	r1.open('GET', 'https://www.facebook.com/', false);
	r1.send();

	raw_el = $(r1.responseText);
	ticks_ul_str = raw_el.find('code#u_0_2m')[0].innerHTML.slice(5, -4);
	ticks_ul = $(ticks_ul_str);

	oldest = r1.responseText.match(/oldest=(\d+)/);
	chrome.runtime.sendMessage({type: "appendTicksList", payload: ticks_ul[0].innerHTML}, function(response) {
	});
	getTicks(oldest[1]);
}

function urlencodeFormData(fd){
    var s = '';
    function encode(s){ return encodeURIComponent(s).replace(/%20/g,'+'); }
    for(var pair of fd.entries()){
        if(typeof pair[1]=='string'){
            s += (s?'&':'') + encode(pair[0])+'='+encode(pair[1]);
        }
    }
    return s;
}

function getTicks(oldest) {
	getMeId();
	var endpoint = '/ajax/ticker_entstory.php';
	var qs = '?source=fst_sidebar&oldest='+oldest+'&dpr=1';
	//getCookies();
	r1 = new XMLHttpRequest();
	r1.onload = function() {
		console.log(this.responseText);
		//res_obj = JSON.parse(this.responseText.substr(9));
		/*
		chrome.runtime.sendMessage({type: "appendLikesList", payload: res_obj.payload}, function(response) {
			if ( response.cursor ) {
				getLikes(response.cursor);
			} else if ( response.stop ) {
				return;
			}
		});*/
	};
	r1.open('POST', site+endpoint+qs, true);
	r1.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	fd = new FormData();
	fd.append('__user', me_id);
	fd.append('__a', '1');
	fd.append('__dyn', '');
	fd.append('__af', 'iw');
	fd.append('__req', '10');
	fd.append('__be', '-1');
	fd.append('__pc', 'EXP4:DEFAULT');
	fd.append('__rev','3017141');
	fd.append('__spin_r', '3017141');
	fd.append('__spin_b', 'trunk');
	//fd.append('__spin_t', '1494594558');
	fd.append('ft[tn]', '+G');
	fd.append('fb_dtsg', '');
	fd.append('logging', '');
	r1.send(urlencodeFormData(fd));
}
