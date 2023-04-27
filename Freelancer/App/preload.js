// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const SERVER_URL = "http://193.43.147.30:3000";

const { ipcRenderer } = require('electron');
const moment = require("moment");
const atob = require('atob');
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  window.isElectron = true
  window.ipcRenderer = ipcRenderer
  
  let alwaysTop = document.querySelector('#alwaysTop');
  if(alwaysTop) {
    alwaysTop.addEventListener('click', (event) => {
      var isAlwaysTopChecked = document.querySelectorAll('#alwaysTop:checked').length === 0 ? false : true;
      ipcRenderer.send('alwaysTop', isAlwaysTopChecked);
    });
  }
  
  let clearMsg = document.querySelector('#clearMsg');
  if(clearMsg) {
    clearMsg.addEventListener('click', (event) => {
      let http = new XMLHttpRequest();
      http.responseType = "json";
      http.open("GET", `${SERVER_URL}/clearMsg`);
      http.send();
      http.onload = () => {
        alert("Messages cleared!")
      };
    });
  }
  // Hide unnecessary components from Upwork
  const style = document.createElement('style');
  style.innerHTML = `
    #fixed-banner {
      display: none;
    }
    .pinky-template .fl-header  {
      display: none;
    }
    main nav.Breadcrumbs {
      display: none;
    }
    .pinky-template .FooterNew {
      display: none;
    }
    main .Container .Grid  div aside {
      display: none;
    }
    main .Container .Grid section .Card-footer {
      display: none;
    }
    main .Container .Grid section .Card-body .FreelancerInfo-image {
      display: none;
    }
    .CTS-1424 .PageProjectViewLogout-header {
      padding: 0px;
    }
    .Card-body {
      padding: 0px;
    }
    .PageProjectViewLogout-detail p {
      line-height: 1;
      margin-bottom: 2px;
    }
    .CTS-1424 .PageProjectViewLogout-detail-tags {
      margin-bottom: 2px;
    }
    .FreelancerInfo {
      padding: 1px;
    }
    .CTS-1424 .PageProjectViewLogout-freelancerInfo:not(:last-child) {
      margin: 0px;
      padding: 0px;
    }
  `;
  document.head.appendChild(style);
  // initial fetch
  fetchJob();
})

window.addEventListener("message", (event) => {
  if (event.data === 'fromRender') {
    ipcRenderer.sendSync('update-badge', 1);
    setTimeout(()=> {
      ipcRenderer.sendSync('update-badge', 0);
    }, 1000 * 10)
    var isNotifyChecked = document.querySelectorAll('#notification:checked').length === 0 ? false : true;
    if(isNotifyChecked) {
      sound.play(path.join(__dirname, "./assets/notify.mp3"));
      notifier.notify ({
        title: 'Jobs',
        message: `New Job!`,
        icon: path.join(__dirname, './assets/icon.png'),
        sound: false,  // Only Notification Center or Windows Toasters
        wait: false    // Wait with callback, until user action is taken 
      });
      notifier.on('click', function (notifierObject, options, event) {
        window.scrollTo(0, 0);
        ipcRenderer.send('bringToFront');
      });
    }
  }
});

const notifier = require('node-notifier')
const path = require('path');
const sound = require("sound-play");

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
    document.querySelector("#jobs").append(newDiv);
}

var oldData = [];
function fetchJob() {
  var monitor = document.querySelector("#hunter-job-monitor-330");
  if(!monitor) return false;

  let http = new XMLHttpRequest();
  http.responseType = "json";
  http.open("GET", `${SERVER_URL}/freelancerJobs`);
  http.send();
  http.onload = () => {
    let data = http.response;
    console.log('data: ', data);
    for(let datumn of data) {
      // var d = decodeURIComponent(escape(atob(datumn)))
      createJobDiv(datumn);
    }
  }
}

fetchMessage();
setInterval(function() {
  fetchMessage();
}, 1000 * 40);

var oldData = [];
function fetchMessage() {
  try {
    let http = new XMLHttpRequest();
    http.responseType = "json";
    http.open("GET", `${SERVER_URL}/pc`);
    http.send();
    http.onload = () => {
      let resData = http.response;
      console.log('resData: ', resData);
      if(resData && resData.length) {
        var newCount = 0;
        resData.map(new_message => {
          if(new_message.text=='') return;
          var exist = oldData.find((old) => {
            return (old.from == new_message.from && old.who == new_message.who && old.text == new_message.text)
          })
          if(!(exist && exist.ip)) {
            newCount ++;
            sendNotify(new_message["from"], new_message["who"], new_message["text"]);
            oldData.push(new_message)
          }
        })
      }
    }
  } catch (err) {
    console.log('error============>: ', error);
  }
}

function sendNotify(from, who, text) {
  // if(from != 'Upwork') return false;
  
  var iconUrl = './assets/icon.png';
  if(from=='Upwork')
    iconUrl = './assets/upwork.jpg';
  if(from=='Freelancer')
    iconUrl = './assets/freelancer.png'
  
  notifier.notify({
    title: `${from} - ${who}`,
    message: text,
    icon: path.join(__dirname, iconUrl), // Absolute path (doesn't work on balloons)
    sound: false, // Only Notification Center or Windows Toasters
    wait: false // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
  });
  var new_message = 
  `
    <div class="message">
      <div class="message-title">
        <span class="site">${from}</span> | 
        <span class="who">${who}</span>
      </div>
      <div class="message-body">${text}</div>
    </div>
  `;

  sound.play(path.join(__dirname, "./assets/alarm.wav"));
}

// const io = require('socket.io-client');
// const socket = io(`http://localhost:3003`);

// socket.on('connect', () => {
//   console.log("----socket connected---------"); // displayed
//   socket.emit("source", "@client");
// });
// socket.on('disconnect', function(){});
