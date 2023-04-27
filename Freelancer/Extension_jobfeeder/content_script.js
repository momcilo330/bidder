console.log('============================================Freelancer Job Feeder!!!===========================================');

if(window.location.href == 'https://www.freelancer.com/navigation/updates') {
	let jobCapture = chrome.extension.connect({
		name: "freelancer <-> background.js"
	});

	function grabNewJob() {
		var projectDetailSeoUrl = null;
		var firstJob = document.querySelector("app-feed-item a");
		if(firstJob) {
			var url = firstJob.getAttribute('href');
			if(url.split('/projects/').length == 1) return null;
			var seoUrl = url.split('/projects/')[1]
			var category = '';
			var name = '';
			if(seoUrl.split('/').length == 1) {
				name = seoUrl.split('/')[0]
			} else {
				category = seoUrl.split('/')[0]
				name = seoUrl.split('/')[1].split('.html')[0];
			}
			var projectUrl = `${category == '' ? '' : category + "%2F"}${name}`;
			projectDetailSeoUrl = `https://www.freelancer.com/api/projects/0.1/projects?limit=1&attachment_details=true&full_description=true&job_details=true&location_details=true&nda_details=true&project_collaboration_details=true&seo_urls%5B%5D=${projectUrl}&selected_bids=true&qualification_details=true&upgrade_details=true&review_availability_details=true&local_details=true&equipment_details=true&invited_freelancer_details=true&client_engagement_details=true&contract_signature_details=true&enterprise_linked_projects_details=true&equipment_group_details=true&webapp=1&compact=true&new_errors=true&new_pools=true`;
			
		}
		return projectDetailSeoUrl;
	}
	var prevDetailUrl = null;
	setInterval(() => {
		var newUrl = grabNewJob();
		if(newUrl && newUrl !== prevDetailUrl) { // arrived new job
			// request!
			let jobPage = new XMLHttpRequest();
			jobPage.responseType = "json"
			jobPage.open("GET", newUrl);
			jobPage.send();
			jobPage.onload = () => {
				let jobJson = jobPage.response;
				if(jobJson.result.projects.length) {
					jobJson.result.projects[0].description = jobJson.result.projects[0].description.replaceAll("\n", "jchjch");
					var userInfoUrl = `https://www.freelancer.com/api/users/0.1/users?avatar=true&badge_details=true&country_details=true&display_info=true&employer_reputation=true&jobs=true&location_details=true&membership_details=true&preferred_details=true&qualification_details=true&responsiveness=true&reputation=true&sanction_details=true&status=true&users%5B%5D=${jobJson.result.projects[0].owner_id}&profile_description=true&marketing_mobile_number=true&webapp=1&compact=true&new_errors=true&new_pools=true`
					let userPage = new XMLHttpRequest();
					userPage.responseType = "json"
					userPage.open("GET", userInfoUrl);
					userPage.send();
					userPage.onload = () => {
						let userJson = userPage.response;
						let data = {job: jobJson, user: userJson};
						let dataStr = JSON.stringify(data)
						jobCapture.postMessage({txt: "@freelancerNewJob", job: dataStr})
					};
				}
			};
		}
		prevDetailUrl = newUrl
	}, 1000 * 1)

}

