var id = 0;
var page = 1;
var html;

function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getUserWall(id, page) {
	chrome.runtime.sendMessage({type: "getUserWall", id: id, page: page}, function(response) {
	});
}

chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
			if (request.type == "appendUserWall") {
				if ( request.html ) {
					html = $(request.html);
					content = {};
					html.each(function() {
						if ( $(this)[0].text.includes('pagelet_timeline_recent_segment') ) {
							content_text = $(this)[0].text;
							json_start = content_text.indexOf('respond(0, {') + 'respond(0, {'.length -1;
							json_end = content_text.indexOf('tti_phase') + 14;
							content = JSON.parse(content_text.substring(json_start, json_end));
							return false;
						}
					});
					adding = $(content.payload.content[Object.keys(content.payload.content)[0]]);
					console.log(content);
					console.log(adding);
					console.log('Appended '+adding[0].children.length+' posts');
					if ( adding[0].children.length == 0 ) {
						$('div#stream').after('<h2 style="color: red">Can\'t load more, know issue. debug: page= '+page+'</h2>');
						window.onscroll = null;
					} else {
						$('div#stream').append(adding)
					}
				}
				sendResponse(true);
			}
			return true;
		});

$(document).ready(function() {
	id = getParameterByName('id');
	page = parseInt(getParameterByName('page')) || 1;
	if ( id ) {
		getUserWall(id, page);
	} else {
	}
});

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		page+=1;
		getUserWall(id, page);
    }
};
