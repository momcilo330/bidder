// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const serverURL = 'http://193.43.147.30:3000'
var socket = io(serverURL);

var modal = document.getElementById("myModal");
var modalCloseBtn = document.getElementById("modal_close_btn");


function initializeModal() {
  document.getElementById("bid_link").textContent = "";
  document.getElementById("bid_title").textContent = "";
  document.getElementById("bid_placedStatus").style.display = "none";
  // document.getElementById("bid_content").value = "";
  document.getElementById("sendProposal_btn").disabled = false;
  document.getElementById("bid_placedStatus").className  = "";
  document.getElementById("bid_questions").innerHTML = "";
  document.querySelector("#sendProposal_btn span").style.display = "none";
}

modalCloseBtn.onclick = function() {
  modal.style.display = "none";
  initializeModal();
}
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

function openNewWindow(link) {
  var newWindow = window.open(link, '_blank', 'width=800,height=900');
  newWindow.focus();
  return false;
}

function copyLink(text) {
  navigator.clipboard.writeText(text);
}


function openBidModal(link, title) {
  var title = decodeURIComponent(escape(window.atob(title)));
  if( modal.style.display == "block") {
    // alert("Close exist modal first!");
    modal.classList.add("shakanim");
    setTimeout(function() {
      modal.classList.remove("shakanim");
    }, 1000);
    return false;
  }

  document.getElementById("bid_link").textContent = link;
  document.getElementById("bid_title").textContent = title;

  // socket.emit("source", "@client12312321321");
  modal.style.display = "block";

}

function getStringBetween(str, start, end) {
  s = str;
	var i = s.indexOf(start);
	if (i >= 0) {
		s = s.substring(i + start.length);
	}
	else {
		return '';
	}
	if (end) {
		i = s.indexOf(end);
		if (i >= 0) {
			s = s.substring(0, i);
		}
		else {
		  return '';
		}
	}
	return s;
}

function placeBid() {
  if(!document.querySelector('input[name=bidder_user]:checked')) {
    return false;
  }

  document.querySelector("#sendProposal_btn span").style.display = "block";
  document.getElementById("sendProposal_btn").disabled = true;

  var jobId = getStringBetween(document.getElementById("bid_link").textContent, "_", "?source");
  if(jobId.length !== 21) {
    console.log("jobId=======================>", jobId);
    alert("Not 21 charaters of JobLinkId");
    return false;
  }
  var jobLink = `https://www.upwork.com/ab/proposals/job/${jobId}/apply/`;
  var answerDoms = document.querySelectorAll("#bid_questions textarea");
  var answerTexts = [];
  for(var k = 0; k < answerDoms.length; k++) {
    answerTexts.push(answerDoms[k].value);
  }

  var json = JSON.stringify({
    link: jobLink,
    text: document.getElementById("bid_content").value,
    price: 0, // document.getElementById("bid_price").value,
    socketId: document.querySelector('input[name=bidder_user]:checked').value,
    answers: answerTexts
  });

  var http = new XMLHttpRequest()
  http.responseType = 'json';
  http.open('POST', serverURL+ "/placeBid", true);
  http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  
  http.send(json);
  http.onload = function () {
    var jsonResponse = this.response;
    console.log("response============>",jsonResponse);

    switch(jsonResponse.str) {
      case "placedBid":
        if(jsonResponse.result.msg == "success") {
          document.getElementById("bid_placedStatus").style.display = "block";
          document.querySelector("#bid_placedStatus span").textContent = "Success!";

          document.getElementById("bid_placedStatus").className  = "bidSuccessDiv";
          document.querySelector("#sendProposal_btn span").style.display = "none";
        }
        break;
      case "questions":
        var div = document.getElementById("bid_questions");
        div.innerHTML = "";
        var html = "";
        for(var i = 0; i < jsonResponse.result.length; i++) {
          html += `
            <label for="">${jsonResponse.result[i]}</label>
            <textarea type="text" style="width:100%"></textarea>
          `;
        }
        div.innerHTML = html;

        document.getElementById("bid_placedStatus").className  = "";
        document.getElementById("sendProposal_btn").disabled = false;
        document.querySelector("#sendProposal_btn span").style.display = "none";
        break;
    }

  };
  return false;
}
// socket ======================================
socket.on('connect', function(){
  console.log("--------------connected!!!!------------");
  socket.emit("source", {type: "@client", name: "localUser"});
});

socket.on('@upworknewJob', function(data){
  window.postMessage({sender: "fromRender", data: data});
});

socket.on('@upworkBotUpdate', function(data){
  console.log("upworkBotUpdate------------------------------");
  var div = document.getElementById("availableBidUsers");
  div.innerHTML = "";
  var html = "";
  
  for(var i = 0; i < data.length; i++) {
    var name = data[i].name;
    if(name.includes("Dyk") || name.includes("Darko") || name.includes("_Fake_")) continue
    html += `
      <input type="radio" id="${name}" name="bidder_user" value="${data[i].socketId}">
      <label for="${name}">${name}</label>
    `;
  }
  div.innerHTML = html;
});
