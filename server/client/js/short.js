document.addEventListener("DOMContentLoaded", function () {
	const fields = {
		target: document.getElementById("target")
	};
	const form = document.getElementsByClassName("form")[0];

	async function onSubmit (e) {
		e.preventDefault();
		const targetUrl = fields.target.value;
		if (targetUrl && targetUrl !== "") {
			const res = await Api.post("/links/", {
				headers: {
					"shorten-url": targetUrl
				}
			});
			if (res.error) {
				showError(`Something went wrong: ${res.error.message}`);
			} else {
				const resultBox = document.getElementsByClassName("result-box")[0];
				const resultLink = document.getElementById("result-link");
				resultLink.href = res.url;
				resultLink.innerText = res.url;
				resultBox.hidden = false;
			}
		} else {
			showError("Please fill out both username and password.");
		}
		return false;
	}
	form.addEventListener("submit", onSubmit);

	function showError (text) {
		const errorBox = document.getElementsByClassName("error-box")[0];
		errorBox.innerText = text;
		errorBox.hidden = false;
	}
});
