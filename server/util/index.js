const path = require("path");
const errors = require("./errors")
// Dirty? Absolutely. Works? Yes.
function generateToken(number) {
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
const dest = path.join(__dirname, "..", "..", "uploads")
module.exports = {
    generateToken,
    ...errors,
    isAlphaNumeric,dest
};