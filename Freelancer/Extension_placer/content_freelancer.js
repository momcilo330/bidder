console.log("========content_freelancer.js added===>", freelancer_chromeextension_data, freelancer_chromeextension_uuid);
freelancer_chromeextension_data = atob(freelancer_chromeextension_data);
freelancer_chromeextension_data = JSON.parse(freelancer_chromeextension_data);

var freelancer_protocalOfContent = chrome.extension.connect({
  name: 'content_freelancer.js <-> background.js',
})

function freelancer_inputValue(selector,value) {
  if(!selector) return;
  selector.focus();
  selector.select();
  selector.value= value;
  selector.click();
  var event = new Event('input', {
      bubbles: true,
      cancelable: true,
  });
  selector.dispatchEvent(new Event('scroll'));
  selector.dispatchEvent(event);
}

async function freelancer_inputText(selector,value) {
  if(!selector) return;
  selector.focus();
  selector.select();
  selector.click();
  selector.value= value;
  // window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  // await new Promise((resolve) => setTimeout(resolve, 1000 * 0.1));
  var event = new Event('input', {
      bubbles: true,
      cancelable: true,
  });
  selector.dispatchEvent(new Event('scroll'));
  await new Promise((resolve) => setTimeout(resolve, 1000 * 0.3));
  selector.dispatchEvent(event);
  await new Promise((resolve) => setTimeout(resolve, 1000 * 0.1));
  selector.blur();
}


async function freelance_inputBid(bid) {
  await waitForElm("input#bidAmountInput");
  freelancer_inputValue(document.querySelector("input#bidAmountInput"), bid.price)
  await new Promise((resolve) => setTimeout(resolve, 1000 * 0.2));

  // await waitForElm(".BidFormInputGroup .BidFormInput")
  var periodInput = document.querySelectorAll('.BidFormInputGroup .BidFormInput')[1]
  if(periodInput.querySelector('label').textContent == 'Weekly Limit') {
    // await waitForElm("input#weeklyLimitInput")
    freelancer_inputValue(document.querySelector("input#weeklyLimitInput"), 30)
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.2));
    
  } else {
    // await waitForElm("input#periodInput");
    freelancer_inputValue(document.querySelector("input#periodInput"), bid.period)
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.2));
    
  }

  // await waitForElm("textarea#descriptionTextArea");
  freelancer_inputText(document.querySelector("textarea#descriptionTextArea"), `${bid.text}`)
  await new Promise((resolve) => setTimeout(resolve, 1000 * 0.2));

}

async function freelancer_sumbitJob(callback) {
  await waitForElm(".BidFormBtn [fltrackinglabel='PlaceBidButton']")
  await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
  document.querySelector(".BidFormBtn [fltrackinglabel='PlaceBidButton']").click();
  
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


async function freelancer_placeBid() {
  await waitForElm("app-bid-form")

  await freelance_inputBid(freelancer_chromeextension_data);
  await freelancer_sumbitJob(function(result) {
    freelancer_protocalOfContent.postMessage({
      uuid: freelancer_chromeextension_uuid,
      txt: '@freelancerContent_placed_result',
      result: result,
      str: 'placedBid'
    });
    // window.close();
  })
}

freelancer_placeBid();
  /* 
link: jobLink,
text: document.getElementById("bid_content").value,
price: document.getElementById("bid_price").value,
period: document.getElementById("bid_deliver_period").value,
socketId: document.querySelector('input[name=bidder_user]:checked').value
 */
freelancer_protocalOfContent.onMessage.addListener(function(msg) {
  console.log('fromBackground=========>', msg);
  if(msg.data) {
    freelancer_placeBid();
  }
});
