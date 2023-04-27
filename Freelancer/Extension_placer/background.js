'use strict'
console.log('===== background.js =====')

const SERVER_URL = "http://193.43.147.30:3000";

const ioClient = io.connect(SERVER_URL);

let tempCallbackFunction = {};
// ioClient.on("seq-num", (msg) => console.info(msg));
ioClient.on("connect", () => {
  ioClient.emit("source", {type: "@freelancerBot", name: "Egor"});
});

ioClient.on("@placeBidOnFreelancerBot", function(data, callback){
  console.log("placeBidOnFreelancerBot==============>", data);
  var uuid ='aaa' +  Math.random();
  tempCallbackFunction[uuid] = callback;

  if(data.link.includes("www.freelancer.com/projects/")) {
    let dataStringify = JSON.stringify(data);
    dataStringify = btoa(dataStringify)
    console.log('in background, data=>', dataStringify)
    chrome.tabs.create({ active: true, url: data.link }, function(tab) {
      chrome.tabs.executeScript(tab.id, {
        code: `
          var freelancer_chromeextension_data='${dataStringify}';
          var freelancer_chromeextension_uuid = '${uuid}';
        `
      }, function(){
        chrome.tabs.executeScript(tab.id, {file: "content_freelancer.js"});
      });
    });
  }
  // callback({status: "success"});
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
        case '@freelancerNewJobs':
          let json;
          json = JSON.stringify({
            jobs: msg.job
          })
          try {
            fetch(`${SERVER_URL}/freelancernewjobs`, {
              method: 'POST', // or 'PUT'
              headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: json,
            })
            .then()
            .catch();
          } catch {}
          
          break;
      }
    })
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
  if(freelancerContentPort) {
    freelancerContentPort.onMessage.addListener(function (msg) {
      switch (msg.txt) {
        case "@freelancerContent_placed_result":
          if(tempCallbackFunction[msg.uuid]) {
            tempCallbackFunction[msg.uuid](msg);
            delete tempCallbackFunction[msg.uuid];
          }
          break;
      }
    });
  }
  
})
