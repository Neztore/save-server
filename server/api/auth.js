// Auth middleware
const {errorGenerator, errors, hasPerms, Perms} = require('../util');
const db = require("../util/db");
const { isLength, isAlphanumeric } = require("validator");
const { adminUser } = require("../../config");



module.exports =  async function checkAuth (req, res, next) {
        // For if auth is done, we're just checking member
        if (!req.cookies || !req.cookies.token || isEmpty(req.cookies.token) || !isLength(req.cookies.token, {min: 100, max: 100})) {

        }
        const authorization = req.headers.authorization;
        if (!authorization || !isLength(authorization, {min: 50, max: 50}) || !isAlphanumeric(req.headers.authorization)) {
            res.status(errors.unauthorized.error.status);
            return res.send(errors.unauthorized)
        } else {
            // An authorization token has been supplied. Verify it.
            const user = await db.getUserByToken(authorization);
            if (!user) {
                // Invalid auth token.
                res.status(403);
                res.send(errorGenerator(403, 'Forbidden: Invalid authorisation token.'))
            } else {
                req.user = user;
                if (adminUser && typeof adminUser === "string") {
                    if (user.username.toLowerCase() === adminUser.toLowerCase()) {
                        user.isAdmin = true
                    }
                }

                next()
            }

        }
    };
