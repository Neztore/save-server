// Main server file
"use strict";
const express = require("express");
const path = require("path");

const files = require("./api/files");
const users = require("./api/users");
const links = require("./api/url");
const auth = require("./middleware/auth");
const csrf = require("./middleware/csrf");

const { errorHandler } = require("./util");
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const { version } = require("../package");

const app = express();

// Global middleware
app.set("view engine", "ejs");
app.enable("trust proxy");
app.use(bodyParser.json());
app.use(cookie());
app.use(csrf)
app.set("x-powered-by", "false");


// Client
const client = path.join(__dirname, "client");
const pages = path.join(client, "pages");
app.use("/css", express.static(path.join(client, "css")));
app.use("/js", express.static(path.join(client, "js")));
app.use("/favicon.ico", express.static(path.join(client, "favicon.ico")));

// Routes
app.use("/api/files", files.router);
app.use("/api/users", users);
app.use("/api/links", links);
app.use("/api/links", links);
app.use("/u", links);

// Main routes
const getLoc = (n) => path.join(pages, `${n}.ejs`);
app.get("/", (req, res) => {
	const runningHours = process.uptime()/(60*60);
	return res.render(getLoc("index"), {
		runningFor: (Math.floor(runningHours * 10) / 10), // uptime in hours, rounded to 1 decimal
		version
	});});
app.get("/login", (req, res) => res.render(getLoc("login")));

app.use("/dashboard", auth.redirect);
app.get("/dashboard", async (req, res) => {
	res.render(getLoc("dashboard"), {
		user: {
			username: req.user.username,
			isAdmin: req.user.isAdmin
		}
	});
});

app.use("/short", auth.redirect);
app.get("/short", async (req, res) => {
	res.render(getLoc("short"));
});

app.get("/:id", files.getFile);

// Error handling
app.use(errorHandler);
app.use(function (_req, res) {
	res.status(404).render(getLoc(404));
});

process.on("uncaughtException", err => {
	console.error("There was an uncaught error", err);
});

module.exports = function(port = 80) {
	app.listen(port, () => console.log(`SaveServer running on port ${port}!`));
	app.set("port", port);
};
