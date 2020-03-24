const express = require("express");
const files = express.Router();
const { errorCatch, generateFileName, errorGenerator, dest, prettyError } = require("../util");
const multer = require("multer");
const db = require("../util/db");
const fs = require("fs");
const auth = require("./auth");
const { isAlphanumeric, isLength, isAscii } = require("validator");


// Multer options
const storage = multer.diskStorage({
    destination: dest,
    filename: async function (req, file, cb) {
        const tok = generateFileName(6);
        file._tok = tok;

        // Extract extension
        const split = file.originalname.split('.');
        if (split.length !== 1) {
            const ext = split[split.length - 1];

            if (ext.length > 5) {

                return cb(null, tok)
            } else {
                file._ext = ext;
                cb(null,`${tok}.${ext}`)
            }

        } else {
            // There is no extension
             cb(null, tok)
        }
    }
});
const removeExt=(str)=>str.substring(0, str.indexOf('.'));
const upload = multer({ storage: storage, limits: {
        fileSize: 10000000
    }});

async function getFile(req, res, next) {
    const {id} = req.params;
    if (id && isLength(id, {min:5, max:15}) && isAscii(id)) {
        const without = removeExt(req.params.id);
        const idStr = (without === "" ? req.params.id : without);
        if (!isAlphanumeric(idStr)) {
            res.status(400).send(prettyError(400, "You provided an invalid file identifier, it should be alphanumeric."))
        }
        const file = await db.getFile(idStr);
        if (file) {
            const loc = `${file.id}${file.extension ? `.${file.extension}`:""}`;
            const options = {
                root: dest
            };
            console.log("File!")
            res.sendFile(loc, options, function (err) {
                if (err) {
                    next(err)
                }
            });
        } else {
            // 404
            next();
        }
    } else {
        res.status(400).send(await prettyError(400, "You provided an invalid file identifier."))
    }
    // remove ext





}
files.get('/file/:id', errorCatch(getFile));

files.use(auth);


files.post('/', upload.array("files", 10), errorCatch(async  function(req, res) {
    if (!req.user) {
        return console.log("what??")
    }
    if (req.files.length !==0) {
        for (let file of req.files) {
            db.addFile(file._tok, file._ext || undefined, req.user.username)
        }
        if (req.files.length === 1) {
            res.send(`https://${req.headers.host}/${req.files[0].filename}`)
        } else {

        }
    } else {
        res.status(400).send(errorGenerator(400, "No file upload detected!"))
    }

}));

files.delete('/:id', errorCatch(async  function(req, res) {
   res.status(errors.notImplemented.status).send(errors.notImplemented)
}));



module.exports = {
    router: files,
    getFile
}
/*
    File recieved;
        - Name allocated
        - File extension extracted
        - Saved to database
 */