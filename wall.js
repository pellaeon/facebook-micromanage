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
	sendResponse({farewell: "goodbye"});
		});
