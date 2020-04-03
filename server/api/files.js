const express = require("express");
const files = express.Router();
const { errorCatch, generateFileName, errorGenerator, dest, prettyError, validFile, getBase } = require("../util");
const multer = require("multer");
const db = require("../util/db");
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");
const { isAlphanumeric, isLength, isAscii } = require("validator");

// Multer options
const storage = multer.diskStorage({
	destination: dest,
	filename: async function (req, file, cb) {
		const tok = await generateFileName(6);
		file._tok = tok;

		// Extract extension
		const split = file.originalname.split(".");
		if (split.length !== 1) {
			const ext = split[split.length - 1];

			if (ext.length > 5) {
				return cb(null, tok);
			} else {
				file._ext = ext;
				cb(null, `${tok}.${ext}`);
			}
		} else {
			// There is no extension
			cb(null, tok);
		}
	}
});
const removeExt = (str) => str.substring(0, str.indexOf("."));
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10000000
	}
});
const extensions = ["md", "js", "py", "ts", "Lua", "cpp", "c", "bat", "h", "pl", "java", "sh", "swift", "vb", "cs", "haml", "yml", "markdown", "hs", "pl", "ex", "yaml", "jsx", "tsx", "txt"];
async function getFile (req, res, next) {
	const { id } = req.params;
	if (id && isLength(id, { min: 5, max: 15 }) && isAscii(id)) {
		const without = removeExt(req.params.id);
		const idStr = (without === "" ? req.params.id : without);
		if (!isAlphanumeric(idStr)) {
			res.status(400).send(prettyError(400, "You provided an invalid file identifier, it should be alphanumeric."));
		}
		const file = await db.getFile(idStr);
		if (file) {
			const loc = `${file.id}${file.extension ? `.${file.extension}` : ""}`;

			if (file.extension && extensions.includes(file.extension.toLowerCase()) && !req.query.download) {
				const content = await openFile(path.join(dest, loc));
				return res.render(path.join(__dirname, "..", "client", "pages", "document.ejs"), {
					content: content,
					isRendered: (file.extension.toLowerCase() === "md" || file.extension.toLowerCase() === "markdown"),
					fileName: loc,
					owner: file.owner,
					// Technically someone could try to pretend to be logged in,
					// but all they get to see is a delete button. Nothing gained.
					isUser: !!req.cookies.authorization
				});
			}

			const options = {
				root: dest
			};
			res.sendFile(loc, options, function (err) {
				if (err) {
					next(err);
				}
			});
		} else {
			// 404
			next();
		}
	} else {
		res.status(400).send(await prettyError(400, "You provided an invalid file identifier."));
	}
}
files.get("/:id", errorCatch(getFile));

files.use(auth);

// Supports uploading multiple files, even though ShareX doesn't.
files.post("/", upload.array("files", 10), errorCatch(async function (req, res) {
	if (!req.user) {
		return console.log("what??");
	}
	if (req.files.length !== 0) {
		for (const file of req.files) {
			db.addFile(file._tok, file._ext || undefined, req.user.username);
		}
		const base = getBase(req);
		res.send({
			url: `${base}/${req.files[0].filename}`,
			deletionUrl: `${base}/dashboard`

		});
	} else {
		res.status(400).send(errorGenerator(400, "No file upload detected!"));
	}
}));

files.delete("/:id", errorCatch(async function (req, res, next) {
	if (req.params.id && validFile(req.params.id)) {
		const without = removeExt(req.params.id);
		const idStr = (without === "" ? req.params.id : without);

		const file = await db.getFile(idStr);
		if (file) {
			if ((file.owner === req.user.username) || req.user.isAdmin) {
				await db.removeFile(file.id);
				const loc = `${file.id}${file.extension ? `.${file.extension}` : ""}`;

				fs.unlink(path.join(dest, loc), (err) => {
					if (err) {
						if (err.code === "ENOENT") {
							console.log(`Tried to delete file ${loc} but it was already removed.`);
						} else {
							return next(err);
						}
					}
					return res.send({ success: true, message: "File deleted." });
				});
			} else {
				return res.status(403).send(errorGenerator(403, "You are not allowed to edit that file."));
			}
		} else {
			return res.status(400).send(errorGenerator(404, "File not found."));
		}
	} else {
		return res.status(400).send(errorGenerator(400, "Invalid file id."));
	}
}));

module.exports = {
	router: files,
	getFile
};
/*
    File recieved;
        - Name allocated
        - File extension extracted
        - Saved to database
 */
function openFile (path) {
	return new Promise(function (resolve, reject) {
		fs.readFile(path, "utf8", (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
}
