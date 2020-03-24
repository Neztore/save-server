
window.addEventListener("DOMContentLoaded", function () {
    // Sidebar
    var helloBox = document.getElementById("hello");
    helloBox.innerText = "Hey, " + window.user.username + "!"

    var tabs = document.getElementById("main-tabs");
    function bindControl () {
        var controllers = tabs.children;
        if (!controllers) { return console.error("Failed to bind control") }

        // Set initial
        showContent(0);

        for (let i=0; i<controllers.length;i++) {
            controllers[i].onclick = function () {
                for (let c =0; c < controllers.length; c++) {
                    if (c===i) {
                        controllers[c].className = "is-active"
                    } else {
                        controllers[c].className = ""
                    }
                }

                showContent(i)
            }
        }
    }
    bindControl();

    function showContent (pos) {
        var content = document.getElementsByClassName("page-content")[0];

        for (var i =0; i<content.children.length; i++) {
            if (i===pos) {
                content.children[i].style.display = "block"
            } else {
                content.children[i].style.display = "none"
            }
        }
    }
    // User list - Only bother if user is admin.
    const list = document.getElementById("users");

    function addBlock(username, me) {
        const block = document.createElement("a");
        block.className = me ? "is-active panel-block":"panel-block";
        block.href = "#" +username;

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
            for (let count = 0; count<block.parentNode.children.length; count++) {
                block.parentNode.children[count].className = "panel-block"
            }
            block.className = "panel-block is-active";

        }
    }
    addBlock(window.user.username, true);
    if (window.user.isAdmin) {
        Api.get("/users/")
            .then(function (users) {
                for (let i=0; i<users.users.length; i++) {
                    const u = users.users[i];
                    if (u.username === window.user.username) continue;
                    addBlock(u.username)
                }
            })
            .catch(console.error)
    }

    // Gallery
    const gallery = document.getElementById("gallery");
    const filterImages = document.getElementsByClassName("filter")[0].children[0];
    const filerAll = document.getElementsByClassName("filter")[0].children[1];

    // source; https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Img
    const imgExtensions = ["jpeg", "jpg", "gif", "png", "exif", "bmp", "webp", "svg", "apng", "cur", "pjpeg", "pjp", "jfif"];

    // Gallery Filter
    let imageOnly = true;
    filterImages.onclick = function() {
        updateFilter(true);
    };
    filerAll.onclick = function() {
        updateFilter(false);
    };
    function updateFilter(state) {
        if (state !== imageOnly) {
            imageOnly = state;
            showFiles();
        }
    }
    let files = [];
    Api.get(`/users/${window.location.hash}/files`)
        .then(function (f) {
            if (f.success) {
                files = f.files;
            } else {
                // show error
                console.error("Failed! ", f.error.message)
            }
            showFiles()
        })
        .catch(console.error)

    function showFiles () {
        for (let i=0; i<files.length;i++) {
            const file = files[i];
            if (imageOnly) {
                // filter
                if (file.extension) {
                    if (imgExtensions.includes(file.extension.toLowerCase())) {
                        showImage(file);
                    }
                }
            } else {
                showFile(file);
            }
        }
    }
    const parent =
    function showImage(fileInfo) {

    }
    function showFile(fileInfo) {

    }

    function  clearChildren(ele) {

    }
});

