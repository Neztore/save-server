const {randomBytes} = require("crypto");

const path = require("path");
const errors = require("./errors");
const { isEmpty, isAlphanumeric, isLength, isWhitelisted } = require("validator");
// Dirty? Absolutely. Works? Yes.
function generateFileName(number) {
    number = parseInt(number);
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < number; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

const dest = path.join(__dirname, "..", "..", "uploads");


function generateToken () {
    return new Promise(function (resolve, reject) {
        randomBytes(80, function(err, buffer) {
            if (err) {
                reject(err);
            }
            const token = buffer.toString('base64');
            resolve(token.substr(0, 50))
        })
    })
}
const fileWhitelist = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.0123456789"
const validTag = (tag)=>typeof tag == "string" && !isEmpty(tag) && isAlphanumeric(tag);
const validFile = (tag)=>typeof tag == "string" && !isEmpty(tag) && isWhitelisted(tag, fileWhitelist) && isLength(tag, {min: 6, max: 20});
module.exports = {
    generateToken,
    generateFileName,
    ...errors,
    isAlphaNumeric: isAlphanumeric,dest,
    validTag,
    validFile
};