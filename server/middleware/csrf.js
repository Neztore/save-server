// CSRF Protection
const { generateToken, errorGenerator } = require("../util");

const protectedMethods = ["post", "patch", "put", "delete"];
module.exports = async function (req, res, next) {
    function fail () {
        return res.status(400).send(errorGenerator(400, "Failed CSRF Token validation"));
    }
    if (protectedMethods.includes(req.method.toLowerCase())) {
        // Validate CSRF presence
        if (req.cookies["CSRF-Token"] && req.get("CSRF-Token")) {
            if (req.cookies["CSRF-Token"] === decodeURIComponent(req.get("CSRF-Token"))) {
                return next();
            }
        }
        return fail();
    } else {
        // It's a get
        if (!req.cookies["CSRF-Token"]) {
            res.cookie("CSRF-Token", await generateToken(), {
                maxAge: 172800000,
                sameSite: "strict",
                httpOnly: false
            });
        }
        return next();
    }
};
