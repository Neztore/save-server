// Main server file
"use strict";
const express = require("express");
const path = require("path");

const files = require("./api/files");
const users = require("./api/users");
const links = require("./api/url");
const auth = require("./middleware/auth");

const { errorHandler } = require("./util");
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");

const app = express();

// Global middleware
app.set("view engine", "ejs");
app.enable("trust proxy");
app.use(bodyParser.json());
app.use(cookie());
app.set("x-powered-by", "false");
app.use(function (req,res,next) {
	req.config = app.get("save_config");
	next();
});

// Client
const client = path.join(__dirname, "client");
const pages = path.join(client, "pages");
app.use("/css", express.static(path.join(client, "css")));
app.use("/js", express.static(path.join(client, "js")));

// Routes
app.use("/api/files", files.router);
app.use("/api/users", users);
app.use("/api/links", links);
app.use("/api/links", links);
app.use("/u", links);

// Main routes
const getLoc = (n) => path.join(pages, `${n}.ejs`);
app.get("/", (req, res) => res.render(getLoc("index")));
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

module.exports = function(config) {
	app.set("save_config", config);
	const { port } = config;
	app.listen(port, () => console.log(`SaveServer running on port ${port}!`));
};

