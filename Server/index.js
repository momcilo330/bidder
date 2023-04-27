const port = 3000;
//=============================================================
//=============================================================

let Parser = require('rss-parser');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);

app.use(bodyParser.json())

let parser = new Parser();
const fs = require('fs');

// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=200-&hourly_rate=25-&location=Americas%2CEurope&client_hires=0%2C1-9&proposals=0-4%2C5-9%2C10-14%2C15-19&paging=0%3B20&api_params=1&q=&securityToken=9f7f80a7d422990c430c18712cb07d3706ff27623860a37ad27e416f151be16f82720c05b9a2a61e53538dd3f81167b50ba8f24f1c5502a891bda329ef85f95b&userUid=948783120980930560&orgUid=948783120980930562";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=100-&hourly_rate=25-&location=Americas%2CEurope&client_hires=0%2C1-9&proposals=0-4%2C5-9%2C10-14%2C15-19&paging=0%3B50&api_params=1&q=&securityToken=9f7f80a7d422990c430c18712cb07d3706ff27623860a37ad27e416f151be16f82720c05b9a2a61e53538dd3f81167b50ba8f24f1c5502a891bda329ef85f95b&userUid=948783120980930560&orgUid=948783120980930562";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=200-&hourly_rate=25-&location=Australia+and+New+Zealand%2CAmericas%2CEurope&client_hires=0%2C1-9&proposals=0-4%2C5-9%2C10-14%2C15-19&paging=0%3B50&api_params=1&q=&securityToken=9f7f80a7d422990c430c18712cb07d3706ff27623860a37ad27e416f151be16f82720c05b9a2a61e53538dd3f81167b50ba8f24f1c5502a891bda329ef85f95b&userUid=948783120980930560&orgUid=948783120980930562";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=400-&duration_v3=month%2Csemester%2Congoing&hourly_rate=30-&location=Australia,Belgium,Canada,Denmark,France,Netherlands,Sweden,United%20States&proposals=0-4%2C5-9%2C10-14%2C15-19%2C20-49&paging=0%3B50&api_params=1&q=&securityToken=9f7f80a7d422990c430c18712cb07d3706ff27623860a37ad27e416f151be16f82720c05b9a2a61e53538dd3f81167b50ba8f24f1c5502a891bda329ef85f95b&userUid=948783120980930560&orgUid=948783120980930562";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=200-&hourly_rate=30-&location=Australia,Belgium,Canada,Denmark,France,Netherlands,Sweden,United%20States&proposals=0-4%2C5-9%2C10-14%2C15-19&paging=0%3B50&api_params=1&q=&securityToken=9f7f80a7d422990c430c18712cb07d3706ff27623860a37ad27e416f151be16f82720c05b9a2a61e53538dd3f81167b50ba8f24f1c5502a891bda329ef85f95b&userUid=948783120980930560&orgUid=948783120980930562";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=200-&hourly_rate=30-&location=Australia,Belgium,Canada,Denmark,France,Netherlands,Sweden,United%20States&proposals=0-4%2C5-9%2C10-14%2C15-19&paging=0%3B50&api_params=1&q=&securityToken=01b779747ff920cae79c91bfe7eb631235a8f5bbbd5f66863a07914ec5907a41a7c398a9e25ea5a8a5dbb1f5a7ae68401635b02ff2058a5b456f3512b967f8a2&userUid=1643915769246707712&orgUid=1643915769246707713";
const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420&subcategory2_uid=531770282589057033%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&budget=100-&hourly_rate=30-&location=Australia,Belgium,Canada,Denmark,France,Netherlands,Sweden,United%20States&proposals=0-4%2C5-9%2C10-14%2C15-19&paging=0%3B50&api_params=1&q=&securityToken=01b779747ff920cae79c91bfe7eb631235a8f5bbbd5f66863a07914ec5907a41a7c398a9e25ea5a8a5dbb1f5a7ae68401635b02ff2058a5b456f3512b967f8a2&userUid=1643915769246707712&orgUid=1643915769246707713";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&subcategory2_uid=531770282589057033%2C531770282589057026%2C531770282589057027%2C531770282589057032%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&contractor_tier=2%2C3&proposals=0-4%2C5-9%2C10-14%2C15-19&budget=100-&hourly_rate=30-&location=Canada%2CUnited+States%2CAustralia+and+New+Zealand%2CEurope&paging=0%3B10&api_params=1&q=&securityToken=01b779747ff920cae79c91bfe7eb631235a8f5bbbd5f66863a07914ec5907a41a7c398a9e25ea5a8a5dbb1f5a7ae68401635b02ff2058a5b456f3512b967f8a2&userUid=1643915769246707712&orgUid=1643915769246707713";
// const upworkUrl = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency&category2_uid=531770282580668420%2C531770282580668419&subcategory2_uid=1517518458442309632%2C531770282589057025%2C531770282589057026%2C531770282589057027%2C531770282589057032%2C531770282589057028%2C531770282584862733&job_type=hourly%2Cfixed&contractor_tier=2%2C3&budget=100-&hourly_rate=20-&location=Canada%2CUnited+States%2CAustralia+and+New+Zealand%2CAmericas%2CEurope&paging=0%3B50&api_params=1&q=&securityToken=01b779747ff920cae79c91bfe7eb631235a8f5bbbd5f66863a07914ec5907a41a7c398a9e25ea5a8a5dbb1f5a7ae68401635b02ff2058a5b456f3512b967f8a2&userUid=1643915769246707712&orgUid=1643915769246707713";

var upworkPrevJobsArray = [];

// initialize
fs.writeFile('./feeds.json', JSON.stringify([]), function(){});
fs.writeFile('./freelancerFeeds.json', JSON.stringify([]), function(){});
fs.writeFile('./inbox.json', JSON.stringify([]), function(){});

async function getFeed() {
  console.log("-------------Get Feed-------------------");
  let feed = await parser.parseURL(upworkUrl);
  
  // fs.writeFile('./feeds.json', JSON.stringify(feed), function(){});
  var newJobs = [];
  for(const newItem of feed.items) {
    if(upworkPrevJobsArray.indexOf(newItem.guid) < 0) { // new
      newJobs.push(newItem);
      upworkPrevJobsArray.push(newItem.guid)
    }
  }
  console.log('=====get feeds:', 'new:', newJobs.length, "totalArr:", upworkPrevJobsArray.length);
  if(newJobs.length) {
    for (let i in socket_users) {
      socket_users[i].socket.emit("@upworknewJob", newJobs);
    }
  }


  if(upworkPrevJobsArray.length > 150)
    upworkPrevJobsArray = upworkPrevJobsArray.slice(upworkPrevJobsArray.length - 60)

  fs.writeFile('./feeds.json', JSON.stringify(feed), function(){});
}

setInterval(function() {
  getFeed();
}, 1000 * 15) // every 1 minute


// Freelancer Jobs
app.post('/freelancernewJob', (req, res) => {
  // alert to users
  for (let i in socket_users_freelancer) {
    socket_users_freelancer[i].socket.emit("@freelancernewJob", req.body);
  }

  fs.readFile("./freelancerFeeds.json", "utf8", (err, jsonString) => {
    var data = JSON.parse(jsonString);
    data.unshift(req.body);
    if(data.length > 20)
      data.splice(20 - data.length)

    fs.writeFile('./freelancerFeeds.json', JSON.stringify(data), function(){
      res.sendStatus(200);
    });
  });

})

app.get('/freelancerJobs', (req, res) => {
  fs.readFile("./freelancerFeeds.json", "utf8", (err, jsonString) => {
    res.send(JSON.parse(jsonString));
  });
})


function getNameFromIp(ip) {
/*   if(ip.includes("91.90.11.212")) {
    return "Mykyta";
  }
  if(ip.includes("45.235.206.141")) {
    return "Jenailson";
  }
  if(ip.includes("62.240.24")) {
    return "Momcilo";
  }
  if(ip.includes("45.235.206.199")) {
    return "Jhonatan";
  } */
  return ip;
}

// Upwork new messages ================================
//======================================================
app.post('/upwork', (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  const from = req.body.from;
  const who = req.body.who;
  const text = req.body.text;
  console.log(`ip: ${ip}, who:${who}, from: ${from}, text: ${text}`);

  fs.readFile("./inbox.json", "utf8", (err, jsonString) => {
    var data = JSON.parse(jsonString);
    var exist = false;
    for(var i =0; i < data.length; i++) {
      if(data[i]["ip"] == ip) {
        data[i]["who"] = who
        data[i]["from"] = from
        data[i]["text"] = text;
        exist = true;
        break;
      }
    }
    if(exist == false) {
      data.push({ip: ip, from: from, who: who, text: text});
    }
    fs.writeFile('./inbox.json', JSON.stringify(data), function(){
      res.sendStatus(200);
    });
  });
  
});

// Freelancer new messages
app.post('/freelancer', (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  const from = req.body.from;
  const who = req.body.who;
  const text = req.body.text;
  console.log(`ip: ${ip}, who:${who}, from: ${from}, text: ${text}`);

  fs.readFile("./inbox.json", "utf8", (err, jsonString) => {
    var data = JSON.parse(jsonString);
    var exist = false;
    for(var i =0; i < data.length; i++) {
      if(data[i]["ip"] == ip) {
        data[i]["who"] = who
        data[i]["from"] = from
        data[i]["text"] = text;
        exist = true;
        break;
      }
    }
    if(exist == false) {
      data.push({ip: ip, from: from, who: who, text: text});
    }
    fs.writeFile('./inbox.json', JSON.stringify(data), function(){
      res.sendStatus(200);
    });
  });
  
});

app.post('/placeBid', (req, res)=> {
  console.log('placeBidPost============>', req.body);
  if(req.body.socketId) {
    var botSocket = socket_upworkBots[req.body.socketId].socket;
    if(botSocket) {
      botSocket.emit('@placeBidOnBot', req.body, function(data){
        res.send(data);
      });
    } else {
      res.send({status: "error"});
    }
    
  }
});

//from app for freelancer bidding
app.post('/placeBidOnFreelancer', (req, res)=> {
  console.log('placeFreelancer============>', req.body);
  if(req.body.socketId) {
    var botSocket = socket_freelancerBots[req.body.socketId].socket;
    if(botSocket) {
      botSocket.emit('@placeBidOnFreelancerBot', req.body, function(data){
        res.send(data);
      });
    } else {
      res.send({status: "error"});
    } 
  }
});

app.get('/pc', (req, res) => {
  fs.readFile("./inbox.json", "utf8", (err, jsonString) => {
    res.send(JSON.parse(jsonString));
  });
});

app.get('/clearMsg', (req, res) => {
  fs.writeFile('./inbox.json', JSON.stringify([]), function(){
    res.sendStatus(200);
  });
});

// Job feeds ==========================================
// ====================================================
app.get('/feeds', (req, res) => {
  fs.readFile("./feeds.json", "utf8", (err, jsonString) => {
    res.send(JSON.parse(jsonString));
  });
});

app.get('/', (req, res) => {
  res.send("hello@");
});


app.use(express.static(__dirname));

// app.listen(8001, () => console.log(`==========>Started server at ${process.env.PORT || 8001}`));
http.listen(port, () => console.log(`==========>Started server at ${port}`));

// Socket.io ====================================
const io = require('socket.io')(http);
const socket_upworkBots = {};
const socket_users = {};
const socket_users_freelancer = {};
const socket_freelancerBots = {};

io.sockets.on("connection", socket => {
  socket.on("source", data => {
    console.log("data=======>", data); // user, type
    if(!data.name) {
      data.name = getNameFromIp(socket.handshake.address)
    }
    if (data.type == "@upworkBot") {
      socket_upworkBots[socket.id] = {socket: socket, name: data.name};
    } else if (data.type == "@client") {
      socket_users[socket.id] = {socket: socket, name: data.name};
    } else if (data.type == "@client-freelancer") {
      socket_users_freelancer[socket.id] = {socket: socket, name: data.name};
    } else if(data.type == "@freelancerBot") {
      socket_freelancerBots[socket.id] = {socket: socket, name: data.name}
    }
      upworkBotUpdate();
      freelancerBotUpdate();
  });

  socket.on("disconnect", () => {
    delete socket_upworkBots[socket.id];
    delete socket_users[socket.id];
    delete socket_users_freelancer[socket.id];
    delete socket_freelancerBots[socket.id];
    upworkBotUpdate();
    freelancerBotUpdate();
  });
});

// for (let i in BROWSER_CLIENTS)
//     BROWSER_CLIENTS[i].emit("Hello Browsers")

// for (let i in SERVER_CLIENTS)
//     SERVER_CLIENTS[i].emit("Hello Servers")

function upworkBotUpdate() {
  var socketUpworkBotsArr = [];
  for(var k in socket_upworkBots) {
    socketUpworkBotsArr.push({socketId: socket_upworkBots[k].socket.id, name: socket_upworkBots[k].name})
  }
  for (let i in socket_users) {
    socket_users[i].socket.emit("@upworkBotUpdate", socketUpworkBotsArr);
  }
}

function freelancerBotUpdate() {
  var socketFreelancerBotsArr = [];
  for(var k in socket_freelancerBots) {
    socketFreelancerBotsArr.push({socketId: socket_freelancerBots[k].socket.id, name: socket_freelancerBots[k].name})
  }
  for (let i in socket_users_freelancer) {
    socket_users_freelancer[i].socket.emit("@freelancerBotUpdate", socketFreelancerBotsArr);
  }
}