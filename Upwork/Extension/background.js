'use strict'
//############################

setInterval(function(){
  const feederUrl = localStorage.getItem('feeder');
  if(feederUrl == undefined || feederUrl == '') {
    return;
  };
  const Http = new XMLHttpRequest();
  Http.open("GET", feederUrl);
  Http.send();
}, 1000*60*10);

//############################
console.log('===== background.js =====')
const SERVER_URL = "http://193.43.147.30:3000";

const ioClient = io.connect(SERVER_URL);

let tempCallbackFunction = {};
// ioClient.on("seq-num", (msg) => console.info(msg));
ioClient.on("connect", () => {
  ioClient.emit("source", {type: "@upworkBot", name: 'Fake'});
});

ioClient.on("@placeBidOnBot", function(data, callback){
  console.log("placeBidOnBot==============>", data);
  var uuid ='aaa' +  Math.random();
  tempCallbackFunction[uuid] = callback;

  if(data.link.includes("www.upwork.com/ab/proposals/job")) {
    let dataStringify = JSON.stringify(data);
    dataStringify = btoa(unescape(encodeURIComponent(dataStringify)));
    chrome.tabs.create({ active: true, url: data.link }, function(tab) {
      chrome.tabs.executeScript(tab.id, {
        code: `
          var ukkk111_chromeextension_data='${dataStringify}';
          var ukkk111_chromeextension_uuid = '${uuid}';
        `
      }, function(){
        chrome.tabs.executeScript(tab.id, {file: "content_upwork.js"});
      });
    });
  }
  // callback({status: "success"});
});


let upworkContentPort, messageNotifyPort;

chrome.extension.onConnect.addListener(function (port) {
  if(port.name == 'content_upwork.js <-> background.js') {
    upworkContentPort = port;
  } else {
    messageNotifyPort = port
  }
  
  if(messageNotifyPort) {
    messageNotifyPort.onMessage.addListener(function (msg) {
      switch (msg.txt) {
        case '@upworkNewMessage':
          let json;
          if (1) { // msg.content
            json = JSON.stringify({
              flag: "yes",
              from: msg.from,
              who: msg.who,
              text: msg.content
            });
            console.log(json)
            fetch(`${SERVER_URL}/upwork`, {
              method: 'POST', // or 'PUT'
              headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: json,
            })
            .then((data) => {
              console.log('Success:', data);
            })
            .catch((error) => {
              console.log('Error:', error);
            });
          }
          break
      }
    });
  }
  if(upworkContentPort) {
    upworkContentPort.onMessage.addListener(function (msg) {
      switch (msg.txt) {
        case "@upworkContent_comingQuestions":
          if(tempCallbackFunction[msg.uuid]) {
            tempCallbackFunction[msg.uuid](msg);
            delete tempCallbackFunction[msg.uuid];
          }
          break;
        case "@upworkContent_placed_result":
          if(tempCallbackFunction[msg.uuid]) {
            tempCallbackFunction[msg.uuid](msg);
            delete tempCallbackFunction[msg.uuid];
          }
          break;
      }
    });
  }
  
})
