// From https://fontawesome.com/icons?d=gallery&q=file&s=solid&m=free
const iconMappings = {
	doc: "fa-file-word",
	docx: "fa-file-word",
	md: "fa-file-alt",
	txt: "fa-file-alt",
	exe: "fa-asterisk",
	zip: "fa-archive",
	"": "fa-file",
	js: "fa-file-code"
};
const extensionMappings = {
	pdf: "Document",
	js: "Javascript",
	py: "Python",
	md: "Markdown document",
	docx: "MS Word Document",
	ts: "Typescript",
	exe: "Executable program",
	db: "Database",
	msi: "Program installer",
	txt: "Text document",
	ods: "Document",
	zip: "File archive",
	mp3: "MP3 sound",
	mp4: "Video"
};

// source; https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Img
const imgExtensions = ["jpeg", "jpg", "gif", "png", "exif", "bmp", "webp", "svg", "apng", "cur", "pjpeg", "pjp", "jfif"];

window.addEventListener("DOMContentLoaded", function () {
	const Persist = window.Persist;
	const showError = window.showError;
	const Api = window.Api;
	const BaseUrl = window.BaseUrl;
	const parseDate = window.parseDate;
	const deleteFile = window.deleteFile;
	const showMessage = window.showMessage;
	
	// Sidebar
	const helloBox = document.getElementById("hello");
	helloBox.innerText = "Hey, " + window.user.username + "!";

	const getTarget = () => Persist.get("targetUser");
	const getTab = () => Persist.get("tab");
	const getFilter = () => Persist.get("filter");

	const setTarget = (value) => Persist.set("targetUser", value);
	const setTab = (value) => Persist.set("tab", value);
	const setFilter = (value) => Persist.set("filter", value);

	// Persistent values - initial
	if (!Persist.get("targetUser")) {
		setTarget(window.user.username);
		setTab(0);
		// True = Image only.
		setFilter(true);
	}
	// Not persistent
	let modalTarget;

	const tabs = document.getElementById("main-tabs");

	function bindControl () {
		const controllers = tabs.children;
		if (!controllers) { return showError("Failed to bind control"); }

		// Set initial
		showContent(getTab());
		setVisibleTab(getTab());

		for (let i = 0; i < controllers.length; i++) {
			controllers[i].onclick = function () {
				setVisibleTab(i);
				setTab(i);
				showContent(i);
			};
		}
		function setVisibleTab (tabNo) {
			for (let c = 0; c < controllers.length; c++) {
				if (c === tabNo) {
					controllers[c].className = "is-active";
				} else {
					controllers[c].className = "";
				}
			}
		}
	}

	bindControl();

	function showContent (pos) {
		const content = document.getElementsByClassName("page-content")[0];

		for (let i = 0; i < content.children.length; i++) {
			if (i === pos) {
				content.children[i].style.display = "block";
			} else {
				content.children[i].style.display = "none";
			}
		}
	}
	// User list - Only bother if user is admin.
	const list = document.getElementById("users");

	function addBlock (username, me) {
		const block = document.createElement("a");
		block.className = getTarget() === username ? "is-active panel-block" : "panel-block";

		const icon = document.createElement("span");
		icon.className = "panel-icon";

		const iEle = document.createElement("i");
		iEle.className = "fa fa-user";
		iEle["aria-hidden"] = true;
		icon.appendChild(iEle);
		block.appendChild(icon);

		const name = document.createTextNode(me ? "Me" : username);
		block.appendChild(name);

		list.appendChild(block);
		block.onclick = function () {
			for (let count = 0; count < block.parentNode.children.length; count++) {
				block.parentNode.children[count].className = "panel-block";
			}

			block.className = "panel-block is-active";
			updateTargetUser(username);
		};
		return block;
	}

	addBlock(window.user.username, true);
	if (window.user.isAdmin) {
		Api.get("/users/")
			.then(function (users) {
				for (let i = 0; i < users.users.length; i++) {
					const u = users.users[i];
					if (u.username === window.user.username) continue;
					addBlock(u.username);
				}
			})
			.catch(showError);
	}
	// Basically combines all actions that happen when user is updated into 1 function
	function updateTargetUser (username) {
		setTarget(username);
		getFiles();
		getLinks();
		userManagement();
	}
	const refreshButton = document.getElementById("refresh");
	refreshButton.onclick = function () {
		updateTargetUser(getTarget());
	};

	// Gallery
	const gallery = document.getElementById("gallery");
	const filterImages = document.getElementsByClassName("filter")[0].children[1];
	const filterAll = document.getElementsByClassName("filter")[0].children[0];

	// Gallery Filter
	filterImages.onclick = function () {
		updateFilter(true);
		setImage();
	};
	filterAll.onclick = function () {
		updateFilter(false);
		setAll();
	};
	function setImage () {
		filterImages.classList.add("is-active");
		filterAll.classList.remove("is-active");
	}
	function setAll () {
		filterImages.classList.remove("is-active");
		filterAll.classList.add("is-active");
	}

	// Initial - persistent
	if (getFilter()) {
		setImage();
	} else {
		setAll();
	}

	function updateFilter (state) {
		if (state !== getFilter()) {
			setFilter(state);
			showFiles();
		}
	}
	let files = [];
	function getFiles () {
		const target = Persist.get("targetUser");
		Api.get(`/users/${target}/files`)
			.then(function (f) {
				if (f.success) {
					files = f.files;
					showFiles();
				} else {
					// show error
					showError(f.error);
				}
			})
			.catch(showError);
	}
	getFiles();

	const parent = gallery.getElementsByClassName("columns")[0];
	const modal = document.getElementsByClassName("modal")[0];
	function showFiles () {
		clearChildren(parent);
		if (files.length === 0) {
			const noContent = document.createElement("h2");
			noContent.className = "has-text-centered";
			noContent.innerText = "There are no items to display.";
			parent.appendChild(noContent);
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (getFilter()) {
				// filter
				if (file.extension) {
					if (imgExtensions.includes(file.extension.toLowerCase())) {
						showImage(file);
					}
				}
			} else {
				if (file.extension && imgExtensions.includes(file.extension.toLowerCase())) {
					showImage(file);
				} else {
					showFile(file);
				}
			}
		}
	}
	// Create the gallery boxes - this is a pain in plain JS.
	function showImage (fileInfo) {
		const col = document.createElement("div");
		col.className = "column is-3 outerBox";
		const img = document.createElement("div");

		const url = `${BaseUrl}/${fileInfo.id}.${fileInfo.extension}`;
		img.style.backgroundImage = `url('${url}')`;
		img.style.backgroundSize = "cover";
		img.className = "file-box box";
		col.appendChild(img);
		parent.appendChild(col);

		col.onclick = function (e) {
			e.preventDefault();
			const img = modal.getElementsByTagName("img")[0];
			const box = modal.getElementsByClassName("box")[0];

			const meta = document.getElementById("modal-meta-text");
			const a = document.getElementById("img-link");

			img.style.display = "block";
			box.style.display = "none";

			img.src = url;
			a.href = url;
			const parsed = new Date(fileInfo.created);
			meta.innerText = `${fileInfo.owner} - ${parseDate(parsed)}`;
			modal.className = modal.className + " is-active";
			modalTarget = fileInfo;
		};
	}

	function showFile (fileInfo) {
		const col = document.createElement("div");
		col.className = "column is-3 outerBox";

		const innerColumns = document.createElement("div");
		innerColumns.className = "columns is-centered is-vcentered";

		const box = document.createElement("div");
		box.className = "box file-box";
		col.appendChild(box);
		box.appendChild(innerColumns);

		const innerCol = document.createElement("div");
		innerCol.className = "column is-6";
		innerColumns.appendChild(innerCol);

		const fileName = `${fileInfo.id}.${fileInfo.extension ? fileInfo.extension : ""}`;
		const url = `${BaseUrl}/${fileName}`;

		const icon = document.createElement("i");
		let iconClass = "fa-file";
		if (fileInfo.extension && iconMappings[fileInfo.extension]) {
			iconClass = iconMappings[fileInfo.extension];
		}

		icon.className = "icon is-large fas " + iconClass;
		innerCol.appendChild(icon);
		const info = document.createElement("p");
		info.className = "has-text-centered";
		info.innerText = `${fileInfo.id}.${fileInfo.extension ? fileInfo.extension : ""}`;
		innerCol.appendChild(info);

		parent.appendChild(col);

		col.onclick = function (e) {
			e.preventDefault();
			// Modal set-up
			const meta = document.getElementById("modal-meta-text");
			const openButton = document.getElementById("modal-open");

			const img = modal.getElementsByTagName("img")[0];
			const box = modal.getElementsByClassName("box")[0];
			const text = document.getElementById("m-file-text");
			const desc = document.getElementById("m-file-desc");

			img.style.display = "none";
			box.style.display = "block";

			text.innerText = fileName;
			if (fileInfo.extension && extensionMappings[fileInfo.extension.toLowerCase()]) {
				desc.innerText = extensionMappings[fileInfo.extension.toLowerCase()];
			} else {
				desc.innerText = "Unknown file type";
			}
			openButton.href = url;
			const parsed = new Date(fileInfo.created);
			meta.innerText = `${fileInfo.owner} - ${parseDate(parsed)}`;
			modal.className = modal.className + " is-active";
			modalTarget = fileInfo;
		};
	}

	function clearChildren (ele) {
		while (ele.firstChild) {
			ele.removeChild(ele.lastChild);
		}
	}

	// Modal
	modal.getElementsByClassName("modal-background")[0].onclick = hideModal;
	modal.getElementsByClassName("modal-close")[0].onclick = hideModal;
	function hideModal () {
		modal.classList.remove("is-active");
	}
	const modalDelete = document.getElementById("modal-delete");
	modalDelete.onclick = function () {
		modalDelete.classList.add("is-loading");
		deleteFile(modalTarget, function () {
			modalDelete.classList.remove("is-loading");
			getFiles();
			hideModal();
		});
	};

	// Links page
	function getLinks () {
		const target = Persist.get("targetUser");
		Api.get(`/users/${target}/links`)
			.then(function (f) {
				if (f.success) {
					showLinks(f.links);
				} else {
					// show error
					showError(f.error);
				}
			})
			.catch(showError);
	}
	getLinks();

	function showLinks (linksList) {
		const tableParent = document.getElementById("links-parent");
		clearChildren(tableParent);
		for (let counter = 0; counter < linksList.length; counter++) {
			const current = linksList[counter];
			const tr = document.createElement("tr");

			const redirect = document.createElement("td");
			const redirectLink = document.createElement("a");
			redirectLink.href = `${BaseUrl}/u/${current.id}`;
			redirectLink.innerText = `${BaseUrl}/u/${current.id}`;
			redirect.appendChild(redirectLink);
			tr.appendChild(redirect);

			const link = document.createElement("td");
			const a = document.createElement("a");
			a.innerText = current.url.substr(0, 50);
			a.href = current.url;
			a.target = "_blank";
			a.rel = "noopener noreferrer";
			link.appendChild(a);
			tr.appendChild(link);

			const dateRow = document.createElement("td");
			dateRow.innerText = parseDate(new Date(current.created));
			tr.appendChild(dateRow);

			const deleteRow = document.createElement("td");
			const deleteButton = document.createElement("button");
			deleteButton.className = "button is-danger is-small";
			const trash = document.createElement("i");
			trash.className = "fas fa-trash ml";
			deleteButton.appendChild(trash);
			deleteButton.appendChild(document.createTextNode("Delete"));
			deleteRow.appendChild(deleteButton);
			tr.appendChild(deleteRow);

			deleteButton.onclick = function () {
				deleteButton.classList.add("is-loading");
				const sure = confirm(`Are you sure you want to delete link ${current.id}?`);
				if (sure) {
					Api.delete(`/links/${current.id}`)
						.then((res) => {
							if (res.success) {
								tr.remove();
							} else {
								showError(res.error);
								deleteButton.classList.remove("is-loading");
							}
						})
						.catch(showError);
				} else {
					deleteButton.classList.remove("is-loading");
				}
			};

			tableParent.appendChild(tr);
		}
	}

	// User management - Every time target updates.
	function userManagement () {
		const tar = getTarget();
		const usernameBox = document.getElementById("settings-username");
		usernameBox.innerText = tar;
	}
	userManagement();

	const secondPassField = document.getElementById("pass2-field");
	if (window.user.isAdmin) {
		secondPassField.remove();
	}
	(function userCreation() {
		const createUser = document.getElementById("create-user");
		const form = document.getElementById("create-user-form");
		const usernameField = document.getElementById("create-username");
		const passwordField = document.getElementById("create-password");
		const errorBox = document.getElementById("create-user-error");
		const submitButton = document.getElementById("create-user-submit");
		const showPass = document.getElementById("create-show-pass");

		if (window.user.isAdmin) {
			createUser.onclick = function () {
				showContent(3);
			};
		} else {
			createUser.remove();
		}
		showPass.addEventListener("change", function () {
			const state = showPass.checked;
			passwordField.type = state ? "text" : "password";
		});
		form.onsubmit = function (e) {
			e.preventDefault();
			let username = usernameField.value;
			let password = passwordField.value;
			
			if (!username || username.length < 3) {
				return showError("Username must be filled out and be more than 3 characters.");
			}
			if (username.length > 50) {
				return showError("Username cannot be more than 50 characters... why tho?");
			}
			
			if (!password || password.length < 3) {
				return showError("Password must be filled out and be more than 3 characters.");
			}
			if (password.length > 50) {
				return showError("Password cannot be more than 100 characters. Bcrypt only makes use of the first 72 bytes.");
			}
			submitButton.classList.add("is-loading");
			Api.post("/users/create", {
				body: {
					username: username,
					password: password
				}
			})
				.then(function (res) {
					submitButton.classList.remove("is-loading");
					if (res.error) {
						showCreateError(res.error.message);
					} else {
						showMessage("User created", `User ${username} has been created, and opened in the settings panel.`, "success", 10);
						updateTargetUser(res.username);
						for (let count = 0; count < list.children.length; count++) {
							list.children[count].className = "panel-block";
						}
						addBlock(res.username);
						showContent(2);

					}
				})
				.catch(function (err) {
					submitButton.classList.remove("is-loading");
					console.log(err);
					showError(err.message);
				});

			return false;
		};
		function showCreateError(text) {
			errorBox.innerText = text;
			errorBox.hidden = false;
		}
		

	})();
	(function configButtons() {
		const uploadConfig = document.getElementById("download-upload-config");
		const linkConfig = document.getElementById("download-link-config");
		uploadConfig.onclick = function () {
			const target = getTarget();
			window.location = `/api/users/${target}/config`;
		};

		linkConfig.onclick = function () {
			const target = getTarget();
			window.location = `/api/users/${target}/config?link=true`;
		};
	})();
	(function passwordReset () {
		// Password reset
		const form = document.getElementById("password-change-form");
		const passwordInput = document.getElementById("password");
		const passwordConfirm = document.getElementById("password2");
		const passView = document.getElementById("show-pass");
		const errorBox = document.getElementById("password-error-box");
		const submitButton = document.getElementById("password-reset-submit");

		passView.addEventListener("change", function () {
			const state = passView.checked;
			passwordInput.type = state ? "text" : "password";
		});

		// This means that we use built in validation and means password managers etc. generally just work. Much better than binding to click.
		form.onsubmit = function (e) {
			e.preventDefault();
			const pass = passwordInput.value;

			if (!window.user.isAdmin) {
				// Check confirm is there
				const oldPass = passwordConfirm.value;

				if (!oldPass || oldPass === "" || oldPass.length <= 3) {
					showPasswordError("You must provide your current password. If you do not know it, ask the root user to reset it for you.");
					return false;
				}
			}

			if (pass && pass !== "" && pass.length > 6) {
				// it's good - we already checked that it matches.
				submitButton.classList.add("is-loading");
				errorBox.hidden = true;
				const target = getTarget();
				Api.patch(`/users/${target}/password`, {
					body: {
						newPassword: pass,
						oldPassword: passwordConfirm ? passwordConfirm.value : undefined
					}
				})
					.then(function (res) {
						if (!res.error) {
							submitButton.classList.remove("is-loading");
							showMessage("Password updated", `${target === window.user.username ? "Your" : `${target}'s `} password was successfully updated.`, "success", 10000);
						} else {
							showError(res.error);
							submitButton.classList.remove("is-loading");
						}
					})
					.catch(function (e) {
						submitButton.classList.remove("is-loading");
						showError(e);
					});
			} else {
				showPasswordError("You must fill out the password. It should be more than 6 characters.");
				return false;
			}

			function showPasswordError (text) {
				errorBox.innerText = text;
				errorBox.hidden = false;
			}
		};
	})();
	const tokenB = document.getElementById("update-token");
	function onTokenClick () {
		tokenB.classList.add("is-loading");
		const tar = getTarget();
		const sure = confirm("Are you sure you want to do this? You will need to update the ShareX config for this user.");
		if (sure) {
			Api.patch(`/users/${tar}/token`)
				.then(function (res) {
					if (!res.error) {
						tokenB.classList.remove("is-loading");
						const tar = getTarget();
						const str = tar === window.user.username ? "Your token was successfully reset. Make sure you update your ShareX config!" : `${tar}'s token was reset. Make sure they update their ShareX config!`;

						showMessage("Token reset", str, "success", 15000);
						const tokenBox = document.getElementById("reset-box");
						tokenBox.innerHTML = `Success! New token: <code>${res.token}</code>.`;
						tokenBox.hidden = false;
					} else {
						showError(res.error);
					}
				})
				.catch((e) => showError(e));
		} else {
			tokenB.classList.remove("is-loading");
		}
	}
	tokenB.onclick = onTokenClick;

	(function deleteUser () {
		const deleteAll = document.getElementById("delete-all");
		const deleteUsr = document.getElementById("delete-user");
		deleteAll.onclick = function () {
			deleteUser(true);
		};

		deleteUsr.onclick = function () {
			deleteUser(false);
		};

		function deleteUser (deleteFiles) {
			// we don't want user to click the other one while it's deleting
			deleteAll.classList.add("is-loading");
			deleteUsr.classList.add("is-loading");

			const target = getTarget();
			const sure = confirm(`Are you sure you want to delete ${target} ${deleteFiles ? "and all of their files" : ""}?`);
			if (!sure) {
				doneLoading();
				return false;
			}

			Api.delete(`/users/${target}?deleteFiles=${deleteFiles}`)
				.then(function (res) {
					if (res.error) {
						showError(res.error);
						doneLoading();
					} else {
						// it went ok
						doneLoading();
						updateTargetUser(window.user.username);
						window.location.reload();
					}
				})
				.catch(function () {
					doneLoading();
				});

			function doneLoading () {
				deleteAll.classList.remove("is-loading");
				deleteUsr.classList.remove("is-loading");
			}
		}
	})();
});
