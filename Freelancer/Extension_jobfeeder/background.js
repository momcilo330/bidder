'use strict'
console.log('===== background.js =====')

const SERVER_URL = "http://localhost:3000";

const ioClient = io.connect(SERVER_URL);

let tempCallbackFunction = {};
// ioClient.on("seq-num", (msg) => console.info(msg));
ioClient.on("connect", () => {
  ioClient.emit("source", {type: "@freelancerBot", name: 'jobFeeder'});
});

let freelancerContentPort, messageNotifyPort, jobPort;

chrome.extension.onConnect.addListener(function (port) {
  if(port.name == 'content_freelancer.js <-> background.js') {
    freelancerContentPort = port;
  } 
  if(port.name == 'gmail <-> background.js') {
    messageNotifyPort = port;
  }
  if(port.name == 'freelancer <-> background.js') {
    jobPort = port;
  }
  
  if(jobPort) {
    jobPort.onMessage.addListener(function (msg) {
      switch(msg.txt) {
        case '@freelancerNewJob':
          try {
            fetch(`${SERVER_URL}/freelancernewjob`, {
              method: 'POST', // or 'PUT'
              headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: msg.job,
            })
            .then()
            .catch();
          } catch {}
          
          break;
      }
    })
  }
})
