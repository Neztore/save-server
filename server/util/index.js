const { randomBytes } = require("crypto");

const path = require("path");
const errors = require("./errors");
const { isEmpty, isAlphanumeric, isLength, isWhitelisted } = require("validator");
const adminUser = "root";
const hashRounds = 12;

// Dirty? Absolutely. Works? Yes.
function generateFileName (len = 6) {
	return new Promise(function (resolve, reject) {
		randomBytes(len, function (err, buffer) {
			if (err) {
				reject(err);
			}
			const token = buffer.toString("hex");
			resolve(token.substr(0, len));
		});
	});
}

const dest = path.join(__dirname, "..", "..", "uploads");

const fileWhitelist = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.0123456789";
function generateToken () {
	return new Promise(function (resolve, reject) {
		randomBytes(80, function (err, buffer) {
			if (err) {
				reject(err);
			}
			const token = buffer.toString("base64");
			resolve(token.substr(0, 50));
		});
	});
}

const validTag = (tag) => typeof tag === "string" && !isEmpty(tag) && isAlphanumeric(tag);
const validFile = (tag) => typeof tag === "string" && !isEmpty(tag) && isWhitelisted(tag, fileWhitelist) && isLength(tag, { min: 6, max: 20 });

const getBase = (req)=> `${req.secure ? "https" : "http"}://${req.get("host")}`;
module.exports = {
	generateToken,
	generateFileName,
	...errors,
	isAlphaNumeric: isAlphanumeric,
	dest,
	validTag,
	validFile,
	adminUser,
	hashRounds,
	getBase
};
