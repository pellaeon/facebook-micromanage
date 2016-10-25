var COOKIES = [];
var UA = window.navigator.userAgent;
var me_id = '';

// http://stackoverflow.com/questions/10334909/associate-a-custom-user-agent-to-a-specific-google-chrome-page-tab/10339902#10339902
chrome.webRequest.onBeforeRequest.addListener(
		function(info) {
			console.log("Cat intercepted: " + info.url);
			return { cancel: true };
		},
		// filters
		{
			urls: [
				"https://www.facebook.com/ajax/typeahead/*",
				"https://www.facebook.com/ufi/typing/*",
				"https://pixel.facebook.com/ajax/chat/opentab_tracking.php*",
				"https://www.facebook.com/ajax/messaging/typ.php*"
			],
			types: ["xmlhttprequest"]
		},
		// extraInfoSpec
		["blocking"]
);

chrome.browserAction.onClicked.addListener(
		function(tab) {
		chrome.tabs.create({
				'url': chrome.extension.getURL("wall.html")
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
			}
		});

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
	r1 = new XMLHttpRequest();
	r1.onreadystatechange = function() {
		re = /USER_ID\":\"(\d+)\"/;
		res = re.exec(this.responseText);
		me_id = res[1];
	};
	r1.open('GET', 'https://www.facebook.com/me', false);
	r1.send();
}

function getUserWall(id) {
}

function builddataQS(me_id, cursor='') {
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
	var site = 'https://www.facebook.com';
	var endpoint = '/ajax/pagelet/generic.php/AllFriendsAppCollectionPagelet';
	console.log(builddataQS(me_id));
	var qs = '?dpr=1&data='+builddataQS(me_id, cursor)+'&__user='+me_id+'&__a=1&__dyn=';//__a=1 is significant
	//getCookies();
	r1 = new XMLHttpRequest();
	r1.onreadystatechange = function() {
		res_obj = JSON.parse(this.responseText.substr(9));
		console.log(res_obj);
		chrome.runtime.sendMessage({type: "appendFriendList", payload: res_obj.payload}, function(response) {
			if ( response.cursor )
				getFriendList(parseInt(response.cursor));
		});
	};
	r1.open('GET', site+endpoint+qs, true);
	//r1.setRequestHeader('user-agent', UA);
	r1.send();

}
