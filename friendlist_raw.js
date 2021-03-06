$(document).ready(function() {
	chrome.runtime.sendMessage({type: "getSavedFriendList"}, function(response) {
		if ( response.friendlist_ul.length ) {
			$('ul#timeline').after(response.friendlist_ul);
			ul = $(response.friendlist_ul);
			ids = ul.children('li').each(function() {
				id = $(this).find('button.FriendRequestOutgoing').attr('data-profileid');
				name = $(this).find('div.fsl.fwb.fcb > a').text();
				if ( id == undefined ) {
					console.log($(this));
				}
				$('ul#friend_ids').append('<li><a href="wall.html?id='+id+'">'+id+' '+name+'</a></li>');
			});
			$('h2#count').text(ul.children('li').length+' friends');
			console.log(ids);
		}
	});
});
