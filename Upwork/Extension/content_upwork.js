console.log("====================content_upwork.js added===>", ukkk111_chromeextension_data, ukkk111_chromeextension_uuid);
ukkk111_chromeextension_data = decodeURIComponent(escape(window.atob(ukkk111_chromeextension_data)));
ukkk111_chromeextension_data = JSON.parse(ukkk111_chromeextension_data);

var ukkk111_protocalOfContentUpk = chrome.extension.connect({
  name: 'content_upwork.js <-> background.js',
})

function ukkk111_isHourlyJob() {
  return document.querySelector('[data-cy="clock-timelog"]') ? true: false;
}

function ukkk111_inputValue(selector,value) {
  selector.focus();
  selector.select();
  selector.value= value;
  var event = new Event('input', {
      bubbles: true,
      cancelable: true,
  });
  selector.dispatchEvent(event);
}

function ukkk111_inputBlur(selector) {
  selector.focus();
  selector.select();
  var event = new Event('blur', {
      bubbles: true,
      cancelable: true,
  });
  selector.dispatchEvent(event);
}

async function ukkk111_inputPrice() {
  await waitForValue('[id="step-rate"]');
  var hourlyPriceStr = document.querySelector('ul.fe-ui-job-features li:nth-child(2) div.header strong span').textContent
  var clientPrice = Number(hourlyPriceStr.replace("-$", ""))
  var myHourlyPrice = Number(document.querySelector('[id="step-rate"]').value);
  if(myHourlyPrice > clientPrice) {
    
    ukkk111_inputValue(document.querySelector('[id="step-rate"]'), `${clientPrice}`);
    await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
    ukkk111_inputBlur(document.querySelector('[id="step-rate"]'));
  }
}

function ukkk111_checkQuestions() {
  var answers = ukkk111_chromeextension_data.answers;
  var questLabelsArr = [];
  var questDomsArr = []

  var questionDivs = document.querySelectorAll('div.fe-proposal-job-questions div.up-form-group');

  for(var i = 0; i < questionDivs.length; i++) {
    questLabelsArr.push(questionDivs[i].querySelector('label.up-label').textContent);
    questDomsArr.push(questionDivs[i].querySelector('.up-textarea'));
  }

  if(questLabelsArr.length) {
    if(answers && questLabelsArr.length == answers.length) {
      // input answers as for questionLabels
      for(var k = 0; k < questDomsArr.length; k++) {
        ukkk111_inputValue(questDomsArr[k], answers[k]);
      }
    } else { // send questionLabels to user!
      return {flag: false, questions: questLabelsArr}
    }
  }
  return {flag: true, questions: null}
}

async function ukkk111_hourlyJob() {
  ukkk111_inputPrice();
  await waitForElm(".up-textarea");
  // write cover letter
  ukkk111_inputValue(document.querySelector('.up-textarea'), ukkk111_chromeextension_data.text);
}

async function ukkk111_fixedJob() {
  // milestone
  await waitForElm("[name='milestoneMode'][value='default']");
  document.querySelector("[name='milestoneMode'][value='default']").click();
  // period
  document.querySelector('div.fe-proposal-job-estimated-duration').click();
  document.querySelector('div.fe-proposal-job-estimated-duration [data-test="dropdown-toggle"]').click();
  
  // await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
  await waitForElm("div.up-dropdown-menu-container li");
  document.querySelectorAll('div.up-dropdown-menu-container li')[3].click();
  // cover letter
  ukkk111_inputValue(document.querySelector('.up-textarea'), ukkk111_chromeextension_data.text);
}

async function ukkk111_sumbitJob(callback) {
  // return callback({msg: "success"});
  await waitForElm('footer.pb-10 button.up-btn');
  await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
  document.querySelector('footer.pb-10 button.up-btn').click();
  await new Promise((resolve) => setTimeout(resolve, 1000 * 2));
  // handle openning modal and submitted result
  // checkbox
  var checkbox = document.querySelector("div.up-modal-body div.checkbox label input")
  if(checkbox) {
    checkbox.click();
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.5));
    document.querySelector("div.up-modal-footer button.up-btn-primary").click();
  }
  callback({msg: "success"});
}

/* 
link: jobLink,
text: document.getElementById("bid_content").value,
price: document.getElementById("bid_price").value,
socketId: document.querySelector('input[name=bidder_user]:checked').value,
answers: ["answer1", "answer2"]
 */
function recurTmpFun(selector, resolve) {
  if(document.querySelector(selector).value > 0) {
    return resolve(true);
  } else {
    setTimeout(function() {
      recurTmpFun(selector, resolve);
    }, 200)
  }
}
function waitForValue(selector) {
  return new Promise((resolve) => {
    recurTmpFun(selector, resolve);
  })
}

function recurTmpElementFun(selector, resolve) {
  if(document.querySelector(selector)) {
    return resolve(true);
  } else {
    setTimeout(function() {
      recurTmpElementFun(selector, resolve);
    }, 200)
  }
}
function waitForElm(selector) {
  return new Promise((resolve) => {
    recurTmpElementFun(selector, resolve);
  })
}


async function ukkk111_placeBid() {
  await new Promise((resolve) => setTimeout(resolve, 1000 * 5));
  await waitForElm("div.remaining-balance-details");
  var checkQs = ukkk111_checkQuestions();
  if(checkQs.flag) {
    if(ukkk111_isHourlyJob()) {
      await ukkk111_hourlyJob();
    } else {
      await ukkk111_fixedJob();
    }
    ukkk111_sumbitJob(function(result) {
      ukkk111_protocalOfContentUpk.postMessage({
        uuid: ukkk111_chromeextension_uuid,
        txt: '@upworkContent_placed_result',
        result: result,
        str: 'placedBid'
      });
      // window.close();
    })
  } else {
    ukkk111_protocalOfContentUpk.postMessage({
      uuid: ukkk111_chromeextension_uuid,
      txt: '@upworkContent_comingQuestions',
      result: checkQs.questions,
      str: 'questions'
    });
    window.close();
  }
}

ukkk111_placeBid();
  /* 
link: jobLink,
text: document.getElementById("bid_content").value,
price: document.getElementById("bid_price").value,
socketId: document.querySelector('input[name=bidder_user]:checked').value,
answers: ["answer1", "answer2"]
 */
ukkk111_protocalOfContentUpk.onMessage.addListener(function(msg) {
  console.log('fromBackground=========>', msg);
  if(msg.data) {
    ukkk111_placeBid();
  }
});
