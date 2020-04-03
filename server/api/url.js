// URL Shortener and fetcher
const express = require("express");
const url = express.Router();
const { errorCatch, errorGenerator, generateFileName, prettyError, getBase } = require("../util");
const { isURL, trim, isEmpty, isAlphanumeric } = require("validator");
const auth = require("../middleware/auth");
const db = require("../util/db");

const validTag = (tag) => typeof tag === "string" && !isEmpty(tag) && isAlphanumeric(tag);

url.get("/:tag", errorCatch(async function (req, res, next) {
	const { tag } = req.params;
	if (validTag(tag)) {
		const target = await db.getLink(tag);
		if (target) {
			res.redirect(302, target.url);
		} else {
			// 404
			next();
		}
	} else {
		res.status(400).send(prettyError(400, "Invalid short URL tag."));
	}
}));

url.use("/", auth.redirect);


// Add new URL Shortening
url.post("/", errorCatch(async function (req, res) {
	if (!req.user) {
		throw new Error("no user...?");
	}

	const url = req.headers["shorten-url"];
	if (url && typeof url === "string" && isURL(url)) {
		const tag = await generateFileName(6);
		await db.addLink(tag, trim(url), req.user.username);
		res.send({ success: true, url: `${getBase(req)}/u/${tag}` });
	} else {
		return res.status(400).send(errorGenerator(400, "Bad request: Header \"shorten-url\" must be provided and be a url."));
	}
}));

url.use(auth);
// This is an API request, so it returns JSON.
url.delete("/:tag", errorCatch(async function (req, res) {
	const { tag } = req.params;
	if (validTag(tag)) {
		const link = await db.getLink(tag);
		if (link) {
			if (link.username !== req.user.username) {
				if (!req.user.isAdmin) {
					return res.status(403).send(errorGenerator(403, "You are not allowed to delete that link."));
				}
			}

			await db.removeLink(tag);
			res.send({ success: true, message: "Link removed!" });
		} else {
			// 404
			res.send(404).send(errorGenerator(404, "Link tag not found."));
		}
	} else {
		res.status(400).send(prettyError(400, "Invalid short URL tag."));
	}
}));
module.exports = url;
