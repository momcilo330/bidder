// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const serverURL = 'http://193.43.147.30:3000';
// const serverURL = 'http://localhost:3003'
var socket = io(serverURL);

var modal = document.getElementById("myModal");
var modalCloseBtn = document.getElementById("modal_close_btn");


function initializeModal() {
  document.getElementById("bid_link").textContent = "";
  document.getElementById("bid_title").textContent = "";
  document.getElementById("bid_placedStatus").style.display = "none";
  // document.getElementById("bid_content").value = "";
  document.getElementById("sendProposal_btn").disabled = false;
  document.getElementById("bid_placedStatus").className = "";
  document.querySelector("#sendProposal_btn span").style.display = "none";
}

modalCloseBtn.onclick = function () {
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


function openBidModal(link, title, currency, price) {
  if (modal.style.display == "block") {
    // alert("Close exist modal first!");
    modal.classList.add("shakanim");
    setTimeout(function () {
      modal.classList.remove("shakanim");
    }, 1000);
    return false;
  }

  document.getElementById("bid_link").textContent = link;
  document.getElementById("bid_title").textContent = title;
  document.getElementById("bid_currency").textContent = currency;
  document.getElementById("bid_price").value = price;
  document.getElementById("bid_deliver_period").value = 1
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
  if (!document.querySelector('input[name=bidder_user]:checked')) {
    return false;
  }

  document.querySelector("#sendProposal_btn span").style.display = "block";
  document.getElementById("sendProposal_btn").disabled = true;

  var jobLink = document.getElementById("bid_link").textContent

  var json = JSON.stringify({
    link: jobLink,
    text: document.getElementById("bid_content").value,
    price: document.getElementById("bid_price").value,
    period: document.getElementById("bid_deliver_period").value,
    socketId: document.querySelector('input[name=bidder_user]:checked').value,
  });

  var http = new XMLHttpRequest()
  http.responseType = 'json';
  http.open('POST', serverURL + "/placeBidOnFreelancer", true);
  http.setRequestHeader('Content-type', 'application/json; charset=utf-8');

  http.send(json);
  http.onload = function () {
    var jsonResponse = this.response;
    console.log("response============>", jsonResponse);

    switch (jsonResponse.str) {
      case "placedBid":
        if (jsonResponse.result.msg == "success") {
          document.getElementById("bid_placedStatus").style.display = "block";
          document.getElementById("bid_placedStatus").textContent = "Success!";

          document.getElementById("bid_placedStatus").className = "bidSuccessDiv";
          document.querySelector("#sendProposal_btn span").style.display = "none";
        }
        break;
    }

  };
  return false;
}
// socket ======================================
socket.on('connect', function () {
  console.log("--------------connected!!!!------------");
  socket.emit("source", { type: "@client-freelancer", name: "localUser" });
});

socket.on('@freelancernewJob', function (datumn) { 
  createJobDiv(datumn);
  window.postMessage("fromRender");
});

socket.on('@freelancerBotUpdate', function (data) {
  console.log("@freelancerBotUpdate------------------------------", data);
  var div = document.getElementById("availableBidUsers");
  div.innerHTML = "";
  var html = "";
  for (var i = 0; i < data.length; i++) {
    var name = data[i].name;
    if (name == "jobFeeder") continue;

    html += `
      <input type="radio" id="${name}" name="bidder_user" value="${data[i].socketId}">
      <label for="${name}">${name}</label>
    `;
  }
  div.innerHTML = html;
});


function createJobDiv(datumn) {
  let job = datumn.job.result.projects[0];
  let user = Object.values(datumn.user.result.users)[0];
  if(!job) return;

  let priceMin = Math.round(job.budget.minimum*job.currency.exchange_rate);
  let priceMax = Math.round(job.budget.maximum*job.currency.exchange_rate);

  let skills = "";
  for(let skill of job.jobs) {
    skills += skill.name + ", ";
  }
  let jobStatus = ""; 
  for(let item in job.upgrades) {
    if(item == "listed") continue;
    if(job.upgrades[item] === true) {
      if(jobStatus) jobStatus += ", ";
      jobStatus += item;
    }
  }
  let hourly = null;
  if(job.hourly_project_info) {
    hourly = {hours: job.hourly_project_info.commitment.hours, duration: job.hourly_project_info.duration_enum}
  }
  let jobDescription = job.description.replace(/jchjch/g, '\n');
  let newDiv = document.createElement("div");
    newDiv.className = "job-item";
    newDiv.innerHTML = `
      <div class="job-item-title"><span class="span-title">${job.title}&nbsp;</span></div>
      <div class="job-item-type">
        <span class="user-info-item location">${user.location.country.name}</span>
        <span class="span-budget"><span style="color: orange;border: none;">${job.currency.country}</span> ${priceMin} - ${priceMax} <span style="color: orange;border: none;">${hourly ? ' ' + hourly.hours + '_' + hourly.duration : ''}</span></span>
        <span class="user-info-item registration_date"  time="${user.registration_date * 1000}">${moment(user.registration_date * 1000).fromNow()}</span>
        <span class="span-bidstats" time="${job.submitdate * 1000}"> ${moment(job.submitdate * 1000).fromNow()}</span>
        <span class="span-jobStatus ${jobStatus ? 'true': 'false'}"> ${jobStatus}</span>
      </div>
      
      <div class="user-info">
        <span class="user-info-item public_name"><a href="https://www.freelancer.com/u/${user.username}" target="blank">${user.public_name}</a></span>
        <span class="user-info-item reputation">
          <strong>${Math.round(user.employer_reputation.entire_history.overall *100) / 100 ? Math.round(user.employer_reputation.entire_history.overall *100) / 100 : '-'}</strong>,&nbsp;
          <strong>${user.employer_reputation.entire_history.all ? user.employer_reputation.entire_history.reviews + '/'+user.employer_reputation.entire_history.all : '-'}</strong>
        </span>
        <span class="user-status-badge ${user.status.identity_verified ? 'true': 'false' }"><i class="fa fa-address-card" aria-hidden="true"></i></span>
        <span class="user-status-badge ${user.status.payment_verified ? 'true': 'false' }"><i class="fa fa-paypal" aria-hidden="true"></i></span>
        <span class="user-status-badge ${user.status.phone_verified ? 'true': 'false' }"><i class="fa fa-phone" aria-hidden="true"></i></span>
        <span class="user-status-badge ${user.status.deposit_made ? 'true': 'false' }"><i class="fa fa-dollar" aria-hidden="true"></i></span>
        <span class="user-status-badge ${user.status.facebook_connected ? 'true': 'false' }"><i class="fa fa-facebook-square" aria-hidden="true"></i></span>
        <span class="user-status-badge ${user.status.linkedin_connected ? 'true': 'false' }"><i class="fa fa-linkedin-square" aria-hidden="true"></i></span>
        <span class="user-status-badge ${user.status.profile_complete ? 'true': 'false' }"><i class="fa fa-user" aria-hidden="true"></i></span>
        <span class="user-info-item tagline">${user.tagline == null ? '' : '<i class="fa fa-quote-left" aria-hidden="true"></i> ' + user.tagline}</span>
      </div>
      <div class="job-itme-skills"><span class="span-skills">${skills}</span></div>
      <div class="job-item-content">${jobDescription}</div>
      <div class="job-item-link">
        <div>
          <button style="cursor: pointer;width: 80%;padding: 6px;" onclick="openNewWindow('${"https://www.freelancer.com/projects/"+job.seo_url}')">Show Details</button>
          <button class="openBidModalBtn" style="cursor: pointer;width: 20%;padding: 6px;" onclick="openBidModal('${"https://www.freelancer.com/projects/"+job.seo_url}', '${job.title}', '${job.budget.minimum}-${job.budget.maximum} (${priceMin}-${priceMax})', '${job.budget.maximum}')">Bid</button>
        </div>
      <div>
    `;
    document.querySelector("#jobs").prepend(newDiv);
    newDiv.classList.add("newjob");
    setTimeout(()=> {
      newDiv.classList.remove("newjob");
    }, 1000 * 20);
}

setInterval(() => {
  var posttimeDoms = document.querySelectorAll(".span-bidstats");
  for(let item of posttimeDoms) {
    item.textContent = moment(Number(item.getAttribute('time'))).fromNow()
  }
  var regtimeDoms = document.querySelectorAll(".user-info-item.registration_date");
  for(let item of regtimeDoms) {
    item.textContent = moment(Number(item.getAttribute('time'))).fromNow()
  }
}, 1000 * 20);