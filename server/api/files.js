const express = require("express");
const files = express.Router();
const { errorCatch, generateToken, isAlphaNumeric, errorGenerator, dest } = require("../util");
const multer = require("multer");
const db = require("../util/db");
const fs = require("fs");
const auth = require("./auth");


// Multer options
const storage = multer.diskStorage({
    destination: dest,
    filename: async function (req, file, cb) {
        const tok = generateToken(6);
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
    // remove ext
    const without = removeExt(req.params.id);
    const idStr = without === "" ? req.params.id : without;
    if (isAlphaNumeric(idStr)) {
        // Try to find it
        fs.readdir(dest, function (err, files) {
            if (err) throw err;
            let found = false
            for (let file of files) {
                const noExt = removeExt(file);
                const fileStr = noExt === "" ? req.params.id : noExt;
                if (fileStr === idStr) {
                    found = true;
                    const options = {
                        root: dest
                    };

                    res.sendFile(file, options, function (err) {
                        if (err) {
                            if (err) {
                                next(err)
                            }
                        }
                    });
                    break;
                }
            }
            if (!found) next();
        });



    } else{
        res.send(errorGenerator(400, "Invalid file name - it should be alphanumeric."))
    }
}
files.get('/:id', errorCatch(getFile));

files.use(auth);
files.get('/', errorCatch(async  function(req, res) {
    res.send("Files root...")
}));

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