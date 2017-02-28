cursor = $('div[id^="pagelet_timeline_app_collection"] > ul:first li:last-child button.PageLikedButton').attr('data-profileid');
chrome.runtime.sendMessage({type: "likesInitialCursor", cursor: cursor}, function(response) {
	console.log(response);
});
