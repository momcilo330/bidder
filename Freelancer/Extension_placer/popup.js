const rssElement = document.getElementById("my-rss-feeder");
if(localStorage.getItem('feeder') != undefined)
    rssElement.value = localStorage.getItem('feeder');
rssElement.addEventListener('change', (event) => {
    const rss_feeder = event.target.value;
    console.log(rss_feeder);
    localStorage.setItem('feeder', rss_feeder);
});