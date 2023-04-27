// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const SERVER_URL = "http://193.43.147.30:3000";

const { ipcRenderer } = require('electron');
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
  console.log('----------------------------------------------------------:');
  if(document.querySelector("footer.up-card-footer.up-sticky-card-footer"))
    document.querySelector("footer.up-card-footer.up-sticky-card-footer").style.display = 'none';
  if(document.querySelector("footer.footer-visitor"))
    document.querySelector("footer.footer-visitor").style.display = 'none';
  if(document.querySelector("div.nav-header-wrapper"))
    document.querySelector("div.nav-header-wrapper").style.display = 'none';
  if(document.querySelector("div.nav-v2.nav-visitor"))
    document.querySelector("div.nav-v2.nav-visitor").style.display = 'none'; 
  if(document.querySelector("section[data-test-section='breadcrumb']"))
   document.querySelector("section[data-test-section='breadcrumb']").style.display = 'none';
  if(document.querySelector("header.up-card-header"))
   document.querySelector("header.up-card-header").style.padding = '0px';
  if(document.querySelector("div.job-details-visitor"))
   document.querySelector("div.job-details-visitor").style.margin = '0px';         
   
  var unComponents = document.querySelectorAll("section.up-card-section");
  if(unComponents && unComponents.length)
    unComponents[unComponents.length - 1].style.display = 'none';
  
  var firstJSection = document.querySelector("section.up-card-section");
  if(firstJSection) {
    firstJSection.style = `
      padding: 0px 0px !important;
      background: #9e9e9e2b !important;
    `;
  }

  const style = document.createElement('style');
  style.innerHTML = `
      
      div.mt-20.group {
        width: 100% !important;
      }
      .fluid-layout ul li{
        width: 142px;
      }
      
      ul.cfe-ui-job-features.fluid-layout-md>li {
        width: 170px;
        margin-right: 15px;
        padding-right: 0;
      }
      div#posted-on span.inline{
        background: #FFC107;
        color: black;
      }
      div.d-none.d-md-block span{
        background: #FFEB3B;
        padding: 3px;
        color: black;
      }
      
      ul.cfe-ui-job-features.fluid-layout-md li:nth-child(4) strong{
        background: #3F51B5;
        color: white;
        border-radius: 13px;
        padding: 0px 6px;
      }
      li[data-qa='client-location'] strong{
        background: #03A9F4;
        color: white;
        padding: 3px;
      }
      div[data-cy="clock-hourly"] strong{
        border: 1px solid gray;
        border-radius: 10px;
        padding: 0px 5px;
      }
      ul.cfe-ui-job-features.fluid-layout-md li:nth-child(2) strong{
        border: 1px solid gray;
        border-radius: 10px;
        padding: 0px 5px;
      }
      ul.cfe-ui-job-features.fluid-layout-md li:nth-child(1) strong{
        border: 1px solid gray;
        border-radius: 10px;
        padding: 0px 5px;
      }
      strong[data-qa="client-spend"] {
        background: #FF9800;
        border: 1px solid;
        color: black;
        padding: 3px;
      }
      div[data-qa="client-hires"]{
        background: #FFEB3B;
        color: black !important;
        border: 1px solid black;
        font-weight: bold;
        font-size: 14px;
      }
      div.cfe-about-client-v2 small.text-muted{
        background: #607D8B;
        color: white !important;
        padding: 3px;
      }
      section.up-card-section {
        padding: 8px 0px;
      }
      .mt-20, .my-20 {
        margin-top: -1px!important;
      }
      h4 {
        margin-bottom: 4px;
      }
      div.up-card.py-0.overflow-y-auto {
        margin-top: 8px;
      }
    `;
  document.head.appendChild(style);
  // initial fetch
  fetchJob();
  fetchMessage();
})


const moment = require("moment");
const cheerio = require('cheerio');
const notifier = require('node-notifier')
const path = require('path');
const sound = require("sound-play");

let jobArray = [];


// setInterval(function() {
//   fetchJob();
// }, 1000 * 15);

setInterval(function() {
  fetchMessage();
}, 1000 * 40);

const job_feeder = require('./rssurl')

function createJobDivs(data, isFirstoOnPush = false) {
  for(let i=0; i < data.length; i++) {
    let item = data[i];
    let title = item.title;
    title = title.replace(" - Upwork", "");
    let $ = cheerio.load(item.content);

    let budget, category, skills, country, link;
    let b0 = $("b")[0];
    if(b0) {
      budget = $(b0.nextSibling).text();
      budget = budget.replace(": ", "") ;
    } else {
      budget = "undefined";
    }
    
    let b2 = $("b")[2];
    if(b2) {
      category = $(b2.nextSibling).text();
      category = category.replace(": ", "") ;
    } else {
      category = "undefined";
    }

    let b3 = $("b")[3];
    if(b3) {
      skills = $(b3.nextSibling).text();
      skills = skills.replace(": ", "") ;
    } else {
      skills = "undefined";
    }

    let b4 = $("b")[4];
    if(b4) {
      country = $(b4.nextSibling).text();
      country = country.replace(": ", "") ;
    } else {
      country = "undefined";
    }

    link = $("a").attr("href");

    if($("b")[0]) {
      $($("b")[0].nextSibling).remove();
    }
    if($("b")[1]) {
      $($("b")[1].nextSibling).remove();
    }
    if($("b")[2]) {
      $($("b")[2].nextSibling).remove();
    }
    if($("b")[3]) {
      $($("b")[3].nextSibling).remove();
    }
    if($("b")[4]) {
      $($("b")[4].nextSibling).remove();
    }

    for(let i = 0; i < 6; i++) {
      $($("br")[$("br").length - 1]).remove();
    }

    $("b").remove();
    $("a").remove();
    let newDiv = document.createElement("div");
    // if(isNew) {
    //   newDiv.className = "job-item newjob";
    // } else {
    //   newDiv.className = "job-item";
    // }
    newDiv.className = "job-item";
    
    const jobId = getStringBetween(link, "_", "?source");
    const jobLink = `https://www.upwork.com/ab/proposals/job/${jobId}/apply/`;
    
    newDiv.innerHTML = `
      <div class="job-item-title"><span class="span-title">${title}&nbsp;</span></div>
      <div class="job-item-type"><span class="span-budget">${budget}</span><span class="span-country">${country}</span><span class="span-category">${category}</span><span class="span-timeago" pubDate="${item.pubDate}"> ${moment(item.pubDate).fromNow()}</span></div>
      <div class="job-itme-skills"><span class="span-skills">${skills}</span></div>
      <div class="job-item-content">${$.html()}</div>
      <div style="margin-top:10px;"><button style="cursor: pointer;width: 40%;padding: 6px;" onclick="copyLink('${link}')">Copy</button><button style="cursor: pointer;width: 40%;padding: 6px;" onclick="copyLink('${jobLink}')">Acpy</button><button class="openBidModalBtn" style="cursor: pointer;width: 20%;padding: 6px;" onclick="openBidModal('${link}', '${btoa(unescape(encodeURIComponent(title)))}')">Bid</button></div>
      
    `;
    // <div class="job-item-link" onclick="openNewWindow('${link}')">${link}<div></div>
    if(isFirstoOnPush) {
      document.querySelector("#jobs").prepend(newDiv);
      newDiv.classList.add("newjob");
      setTimeout(()=> {
        newDiv.classList.remove("newjob");
      }, 1000 * 30);
    } else {
      document.querySelector("#jobs").append(newDiv);
    }
  }
}

// Update time before
setInterval(() => {
  var jobDivs = document.querySelectorAll("div#jobs>div.job-item")
  let count = 0;
  for(jobDiv of jobDivs) {
    count++;
    if(count > 30) {
      jobDiv.remove()
    }
  }

  var pubTimeDivs = document.querySelectorAll("span.span-timeago");
  for(let div of pubTimeDivs) {
    div.textContent = moment(div.getAttribute('pubDate')).fromNow()
  }
}, 1000 * 30) // every 30 seconds
function fetchJob() {
  var monitor = document.querySelector("#hunter-job-monitor-330");
  if(!monitor) return false;

  let http = new XMLHttpRequest();
  http.responseType = "json";
  http.open("GET", `${job_feeder}/feeds`);
  http.send();
  http.onload = () => {
    let data = http.response;
    // console.log('data===>: ', data);
    document.querySelector("#jobs").innerHTML = "";
    let newJobCount = 0;
    createJobDivs(data.items)
    // notify
    // ipcRenderer.sendSync('update-badge', newJobCount);
    // var isNotifyChecked = document.querySelectorAll('#notification:checked').length === 0 ? false : true;
    // if(newJobCount > 0 && isNotifyChecked) {
      
    //   sound.play(path.join(__dirname, "./assets/notify.mp3"));
      
    //   notifier.notify ({
    //     title: 'Jobs',
    //     message: `New ${newJobCount} posted!`,
    //     icon: path.join(__dirname, './assets/jobicon.png'),
    //     sound: false,  // Only Notification Center or Windows Toasters
    //     wait: false    // Wait with callback, until user action is taken 
    //   });
    //   notifier.on('click', function (notifierObject, options, event) {
    //     window.scrollTo(0, 0);
    //     ipcRenderer.send('bringToFront');
    //   });
    // }
    // newJobCount = 0;
  }
}


window.addEventListener("message", (event) => {
  console.log("windowPostMessageEvent========>", event)
  if (event.data.sender === 'fromRender') {
    ipcRenderer.sendSync('update-badge', event.data.data.length);
    createJobDivs(event.data.data.reverse(), true)
    setTimeout(()=> {
      ipcRenderer.sendSync('update-badge', 0);
    }, 1000 * 10)
    var isNotifyChecked = document.querySelectorAll('#notification:checked').length === 0 ? false : true;
    if(isNotifyChecked) {
      sound.play(path.join(__dirname, "./assets/notify.mp3"));
      notifier.notify ({
        title: 'Jobs',
        message: `New ${event.data.data.length} posted!`,
        icon: path.join(__dirname, './assets/jobicon.png'),
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

var oldData = [];
function fetchMessage() {
  try {
    let http = new XMLHttpRequest();
    http.responseType = "json";
    http.open("GET", `${SERVER_URL}/pc`);
    http.send();
    http.onload = () => {
      let resData = http.response;
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
  if(from=='Freelancer')
    iconUrl = './assets/freelancer.png'
  if(from=='Upwork')
    iconUrl = './assets/upwork.jpg';
  console.log("who===========>", who, "----", from);
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
// const socket = io(`http://localhost:3000`);

// socket.on('connect', () => {
//   console.log("----socket connected---------"); // displayed
//   socket.emit("source", "@client");
// });
// socket.on('disconnect', function(){});
