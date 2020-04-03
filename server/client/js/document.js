document.addEventListener("DOMContentLoaded", (event) => {
	const showRender = document.getElementById("show-render");
	const showCode = document.getElementById("show-code");
	const markRender = document.getElementById("markdown-render");
	const code = document.getElementById("code");
	const deleteButton = document.getElementById("delete");

	if (deleteButton) {
		deleteButton.onclick = function () {
			deleteButton.classList.add("is-loading");
			deleteFile({ id: fileName }, function (deleted) {
				deleteButton.classList.remove("is-loading");
				if (deleted) {
					document.location = "/dashboard";
				}
			});
		};
	}

	if (showCode && showRender && window.marked) {
		showRender.onclick = function () {
			showRender.classList.add("is-active");
			showCode.classList.remove("is-active");

			code.classList.add("hidden");
			markRender.classList.remove("hidden");
		};
		showCode.onclick = function () {
			showCode.classList.add("is-active");
			showRender.classList.remove("is-active");

			markRender.classList.add("hidden");
			code.classList.remove("hidden");
		};

		markRender.innerHTML = marked(markRender.innerHTML);
	}

	document.querySelectorAll("pre code").forEach((block) => {
		hljs.highlightBlock(block);
	});
});
