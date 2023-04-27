console.log('============================================content!!!===========================================');
if (window.location.hostname == 'mail.google.com') {
	let gmailCapture = chrome.extension.connect({
		name: "gmail <-> background.js"
	});
	
	function grabUpwork() {
    var filter  = Array.prototype.filter;
		var rows = document.querySelectorAll("table.F.cf.zt tbody tr.zA.zE");
		var upworkRows = filter.call(rows, function(row) {
			var email = row.querySelector("td.yX.xY div span.bA4 span").getAttribute('email');
			return email.indexOf("freelancer.com") > -1 || email.indexOf("upwork.com") > -1;
		});
		return upworkRows;
	}

  var previousMessageStr = null;
	setInterval(function() {
		var upworkRows = grabUpwork();
    var who, site, content, currentMessageStr;
		if(upworkRows.length) {
			if(upworkRows[0].querySelector("td.yX.xY div span[data-thread-id][data-legacy-thread-id]") == null) return
			var latestUpworkEmailTxt = upworkRows[0].querySelector("td.yX.xY div span[data-thread-id][data-legacy-thread-id]").textContent;
			var email = upworkRows[0].querySelector("td.yX.xY div span.bA4 span").getAttribute('email');
			site = 'Unknown'
			if(email.indexOf('freelancer.com') > -1)	site = 'Freelancer' // messages@notifications.freelancer.com
			if(email.indexOf('upwork.com') > -1)	site = 'Upwork'
			var messageTitle = upworkRows[0].querySelector("td.yX.xY div span.bA4 span").getAttribute('name');
      content = "[" + messageTitle + "] " + latestUpworkEmailTxt;
			who = 'Egor';
      currentMessageStr = `${who + site + latestUpworkEmailTxt}`;
		} else {
      currentMessageStr = null;
    }
    if(previousMessageStr != currentMessageStr) {
      try {
        gmailCapture.postMessage({txt: "@upworkNewMessage", from: site, who: who, content: content})
      } catch {
        console.log('disconnected port')
      }
    }
    previousMessageStr = currentMessageStr;
	}, 1000 * 5);
	
} else {

}
