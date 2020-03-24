const {randomBytes} = require("crypto");

const path = require("path");
const errors = require("./errors")
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

const isAlphaNumeric = ch => {
    return ch.match(/^[a-z0-9]+$/i) !== null;
};
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

module.exports = {
    generateToken,
    generateFileName,
    ...errors,
    isAlphaNumeric,dest
};