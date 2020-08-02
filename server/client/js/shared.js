function parseDate (time) {
	if (typeof time === "string") {
		time = new Date(time);
	}
	function getClean (date) {
		const diff = (((new Date()).getTime() - date.getTime()) / 1000);
		const day_diff = Math.floor(diff / 86400);

		if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) { console.log("Bad date"); return; }
		return day_diff === 0 && (
			diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
            day_diff === 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
	}
	const timeString = getClean(time);
	if (timeString) {
		return timeString;
	} else {
		const day = time.getDate();
		const month = time.getMonth() + 1;
		const year = time.getFullYear();
		const hour = time.getHours();
		const minutes = time.getMinutes();

		let minuteString = minutes + "";
		if (minuteString.length === 1) {
			minuteString = `0${minuteString}`;
		}
		return `${day}/${month}/${year} at ${hour}:${minuteString}`;
	}
}
function deleteFile (fileInfo, cb) {
	let str = fileInfo.id;
	if (fileInfo.extension) str += fileInfo.extension;
	const sure = confirm(`Are you sure you want to delete ${str}?`);
	if (sure) {
		// Delete the file
		Api.delete(`/files/${fileInfo.id}`)
			.then((res) => {
				if (res.success) {
					if (cb) cb(true);
				} else {
					showError(res.error);
					if (cb) cb();
				}
			})
			.catch(showError);
		// Incase it's open.
	} else {
		if (cb) cb();
	}
}

// We create dynamically because it's easier than ensuring the HTML code exists on every page.
function showMessage (headerContent, content, colour, closeAfter, closeCb) {
	if (closeAfter < 500) {
		// Assume it's been provided in seconds.
		closeAfter = closeAfter * 1000;
	}
	let parent = document.getElementById("message-parent");
	if (!parent) {
		parent = document.createElement("div");
		parent.className = "fixed-message";
		parent.id = "message-parent";

		document.body.appendChild(parent);
	}

	const message = document.createElement("div");
	message.className = `message is-${colour} slideInRight`;

	const header = document.createElement("div");
	header.className = "message-header";

	const headerText = document.createElement("p");
	headerText.innerText = headerContent;
	header.appendChild(headerText);

	const deleteButton = document.createElement("button");
	deleteButton.className = "delete";
	header.appendChild(deleteButton);

	function close () {
		if (message) {
			message.classList.remove("slideInRight");
			message.classList.add("slideOutRight");
			setTimeout(function () {
				message.remove();
			}, 2000);
			if (closeCb) closeCb();
		}
	}
	deleteButton.onclick = close;

	message.appendChild(header);
	const messageBody = document.createElement("div");
	messageBody.className = "message-body";
	messageBody.innerText = content;
	message.appendChild(messageBody);
	parent.appendChild(message);
	if (closeAfter) {
		setTimeout(close, closeAfter);
	}
	return message;
}

function showError (error) {
	if (error.error && error.error.status) {
		error = error.error;
	}
	const errorText = `${error.status ? `${error.status}: ` : ""} Something went wrong`;
	const content = typeof error === "string" ? error : error.message;
	return showMessage(errorText, content, "danger");
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener("DOMContentLoaded", () => {
	// Get all "navbar-burger" elements
	const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);

	// Check if there are any navbar burgers
	if ($navbarBurgers.length > 0) {
		// Add a click event on each of them
		$navbarBurgers.forEach(el => {
			el.addEventListener("click", () => {
				// Get the target from the "data-target" attribute
				const target = el.dataset.target;
				const $target = document.getElementById(target);

				// Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
				el.classList.toggle("is-active");
				$target.classList.toggle("is-active");
			});
		});
	}
});
window.showMessage = showMessage;
window.showError = showError;
window.parseDate = parseDate;
