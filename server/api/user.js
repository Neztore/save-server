// Required methods:
// Login - Retrieves the token string.
// Fetch config
const express = require("express");
const users = express.router();
const auth = require("./auth");
const db = require("../util/db");
const { errorGenerator, errorCatch } = require("../util");
const { isLength, isAlphanumeric } = require("validator");
const { compare, hash } = require("bcrypt");

users.get("/", function (req, res) {
    res.send({"message": "Users root."});
});

users.post("/login", errorCatch( async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if (username && typeof username == "string") {
        if (!password || typeof password !== "string") {
            return res.status(400).send(errorGenerator(400, "Invalid password."))
        }

        if (isLength(username, {min: 3, max: 50}) && isAlphanumeric(username)) {
            // It passes all checks
            const user = await db.getUser(username);
            if (user && user.password) {
                const correct = await compare(password, user.password)
                if (correct) {

                } else {
                    return res.status(403).send(errorGenerator(403, "Forbidden: Invalid username or password."))
                }
            }  else {
                return res.status(404).send(errorGenerator(404, "User not found."))
            }
        } else {
            return res.status(400).send(errorGenerator(400, "Username must be alpha-numeric and between 3 and 50 characters."))
        }
    } else {
        return res.status(400).send(errorGenerator(400, "No username provided!"))
    }
}));

users.use(auth);

// Routes for root account or @me.
users.get("/config/:id", function (req, res) {
    if (req.params.id === "@me") {
        res.send({"message": "Get your config file..."});
    } else {
        if (!req.user.isAdmin) {
            return res.status(401).send(errorGenerator(401, "You must be root to edit other users."))
        }
        res.send({"message": "Get user config file..."});
    }

});

users.post("/create", function (req, res) {
    res.send({"message": "Create new user.."});
});




module.exports = users;