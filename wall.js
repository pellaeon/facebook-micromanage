console.log('hey wall');

$('button#startcrawl').click(function() {
	chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
		  console.log(response);
	});
	$(this).html('Crawling...');
	$(this).attr("disabled", true);
});
