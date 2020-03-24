// Required methods:
// Login - Retrieves the token string.
// Fetch config
const express = require("express");
const users = express.Router();
const auth = require("./auth");
const db = require("../util/db");
const { errorGenerator, errorCatch, generateToken, errors } = require("../util");
const { isLength, isAlphanumeric } = require("validator");
const { compare, hash } = require("bcrypt");
const { hashRounds } = require("../../config");

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
                const correct = await compare(password, user.password);
                if (correct) {
                    if (user.token) {
                        // They have a token. Return it.
                        return res.send({success: true, token: user.token})
                    } else {
                        // No token - generate.
                        const token = await generateToken();
                        await db.setToken(user.username, token);
                        return res.send({success: true, token})
                    }
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

users.patch("/:id/password", errorCatch(async function (req, res) {
   // ID being @me or an ID.
    // Allows the user to change password by providing current password, or if root by force.
}));
users.patch("/:id/token", errorCatch(async function (req, res) {
    // ID being @me or an ID.
    // Allows the user to generate a new token
}));



users.post("/create", errorCatch(async function (req, res) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).send(errors.forbidden)
    }
    const username = req.body.username;
    const password = req.body.password;
    if (username && typeof username == "string") {
        if (!password || typeof password !== "string" || !isLength(password, {min: 3, max:50})) {
            return res.status(400).send(errorGenerator(400, "Invalid password. - Must be > 3 and < 50."))
        }

        if (isLength(username, {min: 3, max: 50}) && isAlphanumeric(username)) {
            // It passes all checks
            const user = await db.getUser(username);
            if (user) {
                return res.status(404).send(errorGenerator(400, "Username is already in use."))
            }  else {
                const hashed = await hash(password, hashRounds);
                await db.addUser(username, hashed);
                res.send({success: true, username})
            }
        } else {
            return res.status(400).send(errorGenerator(400, "Username must be alpha-numeric and between 3 and 50 characters."))
        }
    } else {
        return res.status(400).send(errorGenerator(400, "No username provided!"))
    }
}));




module.exports = users;