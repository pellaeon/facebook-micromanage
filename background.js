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
			if (request.greeting == "hello")
	sendResponse({farewell: "goodbye"});
		});
