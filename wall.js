console.log('hey wall');

$('button#startcrawl').click(function() {
	chrome.runtime.sendMessage({type: "addItem"}, function(response) {
		  console.log(response);
	});
	$(this).html('Crawling...');
	$(this).attr("disabled", true);
});

chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
			if (request.type == "appendFriendList") {
				adding = $(request.payload);
				new_cursor = adding.find('li:last-child button.FriendRequestOutgoing').attr('data-profileid');
				console.log(new_cursor);
				current_cursor = $('ul.uiList li:last-child button.FriendRequestOutgoing').attr('data-profileid');
				if ( new_cursor == current_cursor ) {
					sendResponse({ 'stop': true });
				} else {
					if ( $('ul.uiList').length ) {
						$('ul.uiList:first').append(adding[0].children);
					} else {
						$('ul#timeline').after(adding);
					}
					sendResponse({ 'cursor': new_cursor });
				}
			}
		});
