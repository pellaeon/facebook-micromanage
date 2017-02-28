$('button#startcrawl').click(function() {
	chrome.runtime.sendMessage({type: "getLikes"}, function(response) {
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
			if (request.type == "appendLikesList") {
				if ( !request.payload ) {
					// Done
					$('button#startcrawl').html('Done crawl, saving...');
					console.log("Crawling likes done");
					sendResponse({ 'stop': true }); 
				} else {
					adding = $(request.payload);
					console.log(adding);
					new_cursor = adding.find('li:last-child button.PageLikedButton').attr('data-profileid');
					console.log(new_cursor);
					if ( $('ul.uiList').length ) {
						$('ul.uiList:first').append(adding[0].children);
					} else {
						$('ul#likes').after(adding);
					}
					sendResponse({ 'cursor': new_cursor });
				}
			} else if ( request.type == "saveFriendListDone" ) {
				$('button#startcrawl').html('Done crawl, saving done');
			}
			return true;
		});
