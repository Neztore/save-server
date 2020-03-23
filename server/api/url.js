// URL Shortener and fetcher
const express = require("express");
const url = express.Router();
const { errorCatch, generateToken, isAlphaNumeric, errorGenerator, dest } = require("../util");
const path = require("path");
const fs = require("fs");

url.get("/:id", errorCatch(function () {

}));

// Add new URL Shortening
url.post("/", errorCatch(function (req, res) {
    const url = req.headers.url
    if (url) {
        // TODO: Validate the URL
    } else {
        return res.status(400).send(errorGenerator(400, "Bad request: No url Header provided."))
    }
}));

