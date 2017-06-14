function buildFriendWallDataQS(id, page) {
	data = {"profile_id":parseInt(id),
		"start":0,
		"end":1477983599,
		"query_type":36,
		/* there are 2 query types: recent (type 36) and after_timestamp (type 8),
		 * this one you see is type 36.
		 *
		 * type 8:
		 * {"profile_id":,
			"start":1483257600,
			"end":1514793599,
			"query_type":8,
			"sk":"timeline",
			"filter_after_timestamp":1491114166,
			"lst":"<censored>",
			"section_pagelet_id":"pagelet_timeline_year_current",
			"parent_key":null,
			"force_no_friend_activity":false}
		*/
		"sk":"timeline",
		"lst":me_id+':'+id+':'+String(Math.round(Date.now()/1000)),
		"buffer":50,
		"current_scrubber_key":"recent",
		"page_index":parseInt(page),
		"require_click":false,
		"section_container_id":"u_jsonp_42_g",
		"section_pagelet_id":"pagelet_timeline_recent",
		"unit_container_id":"u_jsonp_42_f",
		"showing_esc":false,
		"adjust_buffer":false,
		"tipld":{
			"sc":3*parseInt(page),// magic number, not accurate, needs tweaking
			"vc":6*parseInt(page)
		},
		"num_visible_units":6*parseInt(page),
		"remove_dupes":true
	};
	return JSON.stringify(data);
}

function getUserWall(id, page) {
	getMeId();
	var endpoint = '/ajax/pagelet/generic.php/ProfileTimelineSectionPagelet';
	var params = {
		dpr:1,
		ajaxpipe:1,
		//ajaxpipe_token:AXhTS1yuV8BV9ueh,
		no_script_path:1,
		data: buildFriendWallDataQS(id, page?page:1),
		__user:parseInt(me_id),
		__a:1,
		__dyn: '',
		//__af:o,
		//__req:jsonp_43,
		__be:-1,
		//__pc:PHASED%3ADEFAULT,
		//__rev:2646857,
		//__srp_t:1477551480,
		//__adt:43
	};
	var qs = buildUrl('',params);
	r1 = new XMLHttpRequest();
	r1.onload = function() {
		chrome.runtime.sendMessage({type: "appendUserWall", id: id, html: this.responseText}, function(response) {
		});
	};
	r1.open('GET', site+endpoint+qs, true);
	r1.send();
}
