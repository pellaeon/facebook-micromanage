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
				getUserWall(request.id)
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

function buildFriendWallDataQS(id, cursor='') {
	data = {"profile_id":parseInt(id),
		"start":0,
		"end":1477983599,
		"query_type":36,
		"sk":"timeline",
		"buffer":50,
		"current_scrubber_key":"recent",
		"page_index":1,
		"require_click":false,
		"section_container_id":"u_jsonp_42_g",
		"section_pagelet_id":"pagelet_timeline_recent",
		"unit_container_id":"u_jsonp_42_f",
		"showing_esc":false,
		"adjust_buffer":false,
		"tipld":{
			"sc":2,
			"vc":4
		},
		"num_visible_units":4,
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
function getUserWall(id, callback) {
	getMeId();
	var endpoint = '/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet';
	var params = {
		dpr:1,
		ajaxpipe:1,
		//ajaxpipe_token:AXhTS1yuV8BV9ueh,
		no_script_path:1,
		data: buildFriendWallDataQS(id),
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

function buildFriendListDataQS(me_id, cursor='') {
	data = {
		'collection_token': me_id+':2356318349:2',//magic number
		'cursor': btoa('0:not_structured:'+cursor),
		"tab_key":"friends",
		'profile_id': parseInt(me_id),//parseInt is significant
		//"q":"",//not required
		"overview":false,
		"ftid":null,
		"order":null,
		"sk":"friends",
		"importer_state":null
	};
	return encodeURIComponent(JSON.stringify(data));
}
function getFriendList(cursor) {
	getMeId();
	var endpoint = '/ajax/pagelet/generic.php/AllFriendsAppCollectionPagelet';
	var qs = '?dpr=1&data='+buildFriendListDataQS(me_id, cursor)+'&__user='+me_id+'&__a=1&__dyn=';//__a=1 is significant
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
