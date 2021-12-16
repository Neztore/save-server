// Auth middleware
const { errors, adminUser } = require("../util");
const db = require("../util/db");
const { isLength, isAscii } = require("validator");

async function checkToken(req, useCookie) {
	let authorization = useCookie ? req.cookies.authorization : req.headers.authorization;
	if (!authorization || typeof authorization !== "string" || !isAscii(authorization)) {
		return false;
	} else {
		authorization = decodeURIComponent(authorization);
		if (!isLength(authorization, { min: 50, max: 50 })) {
			return false;
		}

		// An authorization token has been supplied. Verify it.
		const user = await db.getUserByToken(authorization);
		if (!user) {
			// Invalid auth token.
			return false;
		} else {
			req.user = user;
			if (adminUser && typeof adminUser === "string") {
				if (user.username.toLowerCase() === adminUser.toLowerCase()) {
					user.isAdmin = true;
				}
			}
			return true;
		}
	}
}

// Defaults to cookie
module.exports = async function checkAuth(req, res, next) {
	if (await checkToken(req, true)) {
		next();
	} else {
		res.status(errors.unauthorized.error.status);
		return res.send(errors.unauthorized);
	}
};
// Redirect version
module.exports.redirect = async function checkAuth(req, res, next) {
	if (await checkToken(req, true)) {
		next();
	} else {
		res.redirect("/login");
	}
};

module.exports.header = async function checkAuth(req, res, next) {
	if (await checkToken(req)) {
		next();
	} else {
		res.status(errors.unauthorized.error.status);
		return res.send(errors.unauthorized);
	}
};
