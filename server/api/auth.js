// Auth middleware
const {errorGenerator, errors, hasPerms, Perms} = require('../util');
const db = require("../util/db");
const { isLength, isAscii } = require("validator");
const { adminUser } = require("../../config");

async function checkToken (req) {
    let authorization = req.headers.authorization ? req.headers.authorization : req.cookies.authorization;
    if (!authorization || !isLength(authorization, {min: 50, max: 50}) || !isAscii(authorization)) {
        return false
    } else {
        // An authorization token has been supplied. Verify it.
        const user = await db.getUserByToken(authorization);
        if (!user) {
            // Invalid auth token.
            return false
        } else {
            req.user = user;
            if (adminUser && typeof adminUser === "string") {
                if (user.username.toLowerCase() === adminUser.toLowerCase()) {
                    user.isAdmin = true
                }
            }
            return true;
        }
    }
}
module.exports = async function checkAuth (req, res, next) {
        if (await checkToken(req)) {
            next();
        } else {
            res.status(errors.unauthorized.error.status);
            return res.send(errors.unauthorized)
        }
};
// Redirect version
module.exports.redirect = async function checkAuth (req, res, next) {
    if (await checkToken(req)) {
        next();
    } else {
        res.redirect("/login")
    }
};



