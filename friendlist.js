$('button#startcrawl').click(function() {
	$('ul.uiList:first').remove();
	chrome.runtime.sendMessage({type: "addItem"}, function(response) {
		  console.log(response);
	});
	$(this).html('Crawling...');
	$(this).attr("disabled", true);
});
$('button#clearfriendlist').click(function() {
	chrome.runtime.sendMessage({type: "clearFriendList"}, function(response) {
	});
});

$(document).ready(function() {
	chrome.runtime.sendMessage({type: "getSavedFriendList"}, function(response) {
		console.log(response);
		if ( response.friendlist_ul.length ) {
			$('ul#timeline').after(response.friendlist_ul);
			$('button#startcrawl').html('Crawl again');
		}
	});
});
chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
			if (request.type == "appendFriendList") {
				if ( !request.payload ) {
					// Done
					$('button#startcrawl').html('Done crawl, saving...');
					sendResponse({ 'stop': true, 'friendlist_ul': $('ul.uiList:first')[0].outerHTML });
				} else {
					adding = $(request.payload);
					new_cursor = adding.find('li:last-child button.FriendRequestOutgoing').attr('data-profileid');
					console.log(new_cursor);
					if ( $('ul.uiList').length ) {
						$('ul.uiList:first').append(adding[0].children);
					} else {
						$('ul#timeline').after(adding);
					}
					sendResponse({ 'cursor': new_cursor });
				}
			} else if ( request.type == "saveFriendListDone" ) {
				$('button#startcrawl').html('Done crawl, saving done');
			}
			return true;
		});
