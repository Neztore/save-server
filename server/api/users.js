// User handler
// While called "id", the "id" actually refers to a user's username, as this is what we use to uniquely identify a user.
const express = require("express");
const users = express.Router();
const auth = require("./auth");
const db = require("../util/db");
const { errorGenerator, errorCatch, generateToken, errors } = require("../util");
const { isLength, isAlphanumeric, isEmpty } = require("validator");
const { compare, hash } = require("bcrypt");
const { hashRounds } = require("../../config");


const validUsername = (str) => str && typeof str === "string" && isLength(str, {min: 3, max: 50}) && isAlphanumeric(str);
const validPassword = (str) => str && typeof str === "string" && isLength(str, {min: 3, max:50});
users.post("/login", errorCatch( async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if (validUsername(username)) {
        if (!validPassword(password)) {
            return res.status(400).send(errorGenerator(400, "Invalid password."))
        }

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
        return res.status(400).send(errorGenerator(400, "Invalid username."))
    }
}));

users.use(auth.cookie);

users.get("/", errorCatch( async function (req, res) {
    const users = await db.getUsers()
    res.send({users, success: true})
}));

// Create is an authenticated route - only the root user can do it.
users.post("/create", errorCatch(async function (req, res) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).send(errors.forbidden)
    }
    const username = req.body.username;
    const password = req.body.password;
    if (validUsername(username)) {
        if (!validPassword(password)) {
            return res.status(400).send(errorGenerator(400, "Invalid password. - Must be > 3 and < 50."))
        }

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
        return res.status(400).send(errorGenerator(400, "Invalid username."))
    }
}));

// Routes for root account or @me.
users.use('/:id/', async function (req,res,next) {
    const { id } = req.params;
    if (id) {
        if (id === "@me") {
            req.target = req.user;
            return next();

        } else {
            if (!isEmpty(id) && isAlphanumeric(id)) {
                const user = await db.getUser(id);

                if (user) {
                    req.target = user;
                    if (req.target.username !== req.user.username) {
                        // isAdmin is added by the auth middleware
                        if (req.user.isAdmin) {
                            return next();
                        } else {
                            // They're not admin, but trying to edit another user. no!
                            return res.status(403).send(errors.forbidden)
                        }
                    } else {
                        // They're editing themselves. Just to make sure:
                        req.target = req.user;
                        return next();
                    }
                } else {
                    return res.status(404).send(errorGenerator(404, "User not found."))
                }
            } else {
                return res.status(400).send(errorGenerator(400, "Invalid username."))
            }
        }
    } else {
        throw new Error("No id on user middleware... what?")
    }
});


users.get("/:id/config", function (req, res) {
    // Generate config
    res.send(`Config for ${req.target.username}`);

});

users.patch("/:id/password", errorCatch(async function (req, res) {
   // ID being @me or an ID.
    // Allows the user to change password by providing current password, or if root by force.
    const {newPassword, oldPassword} = req.body;
    if (validPassword(newPassword)) {
        if (!req.user.isAdmin) {
            // They are not admin, so we need to make sure they supplied correct current password
            if (validPassword(oldPassword)) {
                const correct = await compare(oldPassword, req.target.password);
                if (!correct) {
                    return res.status(403).send(errorGenerator(403, "Incorrect current password!"))
                }
            } else {
                return res.status(400).send(errorGenerator(400, "Invalid old password."))
            }
        }
        // they are good - either admin or provided correct pass.
        const hashed = await hash(newPassword, hashRounds);
        await db.setPassword(req.target.username, hashed);
        return res.send({success:true, updatedUser: req.target.username});

    } else {
        return res.status(400).send(errorGenerator(400, "Invalid or no new password provided."))
    }
}));


users.patch("/:id/token", errorCatch(async function (req, res) {
    // ID being @me or an ID.
    // Allows the user to generate a new token
    const newToken = await generateToken();
    await db.setToken(req.target.username, newToken);
    return res.send({success: true, token: newToken})
}));

users.get("/:id/files", errorCatch(async function (req, res) {
    const files = await db.getFiles(req.target.username);
    res.send({success: true, files});
}));

users.get("/:id/links", errorCatch(async function (req, res) {
    const files = await db.getLinks(req.target.username);
    res.send({success: true, files});
}));









module.exports = users;