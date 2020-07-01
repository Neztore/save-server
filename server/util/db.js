const sqlite = require("sqlite3");
const { join } = require("path");
const { adminUser, hashRounds, dest } = require("./index");
const { hash } = require("bcrypt");
const defaultPassword = "saveServerRoot";
const { access, constants }= require("fs");

class Database extends sqlite.Database {
	constructor(name) {
		super(join(__dirname, name), function (err) {
			if (err) {
				console.error("Failed to connect to SQLite database: ", err);
			} else {
				console.log("Database connected");
			}
		});
		const db = this;
		this.once("open", async  function () {
			// Check that "root" exists
			try {
				const root = await this.getUser(adminUser);
				if (!root) {
					console.log("No root user exists. Creating one with default password.");
					await db.addUser(adminUser, await hash(defaultPassword, hashRounds));
				}

			} catch (e) {
				console.error("Failed to check for existing root user! ", e);

			}

		});
		// 30 minutes.
		setInterval(this.checkFiles.bind(this), 1800000);
	}
	// DB Clean-up: Checks that all files on disk.
	// If a file doesn't exist, it is removed from the database.
	async checkFiles () {
		const db = this;
		const files = await this.getFiles();
		if (files) {
			for (let file of files) {
				const loc = join(dest, `${file.id}${file.extension ? `.${file.extension}` : ""}`);
				access(loc, constants.F_OK, async (err) => {
					if (err) {
						// File does not exist
						await db.removeFile(file.id);
					}
				});
			}
		}
	}

	// Generic
	async getOne (sql, ...args) {
		const db = this;
		return new Promise(function (resolve, reject) {
			try {
				db.get(sql, ...args, function (err, row) {
					if (err) return reject(err);
					resolve(row);
				});
			} catch (e) {
				reject(e);
			}

		});
	}
	async getLots (sql, ...args) {
		const db = this;
		return new Promise(function (resolve, reject) {
			try {
				db.all(sql, ...args, function (err, rows) {
					if (err) return reject(err);
					resolve(rows);
				});
			} catch (e) {
				reject(e);
			}

		});
	}
	async query (sql, ...args) {
		const db = this;
		return new Promise(function (resolve, reject) {
			try {
				db.run(sql, ...args, function (err) {
					if (err) return reject(err);
					resolve();
				});
			} catch (e) {
				reject(e);
			}

		});
	}


	// Gets
	async getFile (id) {
		const SQL = "SELECT * from files WHERE id = $1 LIMIT 1";
		return this.getOne(SQL, [id]);
	}
	async getLink (id) {
		const SQL = "SELECT * from links WHERE id = $1 LIMIT 1";
		return this.getOne(SQL, [id]);
	}
	getFiles () {
		const SQL = "SELECT datetime(created,'unixepoch') as created, id, owner, extension FROM files ORDER BY created DESC;";
		return this.getLots(SQL);

	}
	getLinks (username) {
		const SQL = "SELECT datetime(created,'unixepoch') as created, id, url, owner FROM links WHERE links.owner = $1 ORDER BY created DESC LIMIT 600;";
		return this.getLots(SQL, [username]);
	}
	getUsers () {
		const SQL = "SELECT username from users";
		return this.getLots(SQL);
	}
	getUser (username) {
		const SQL = "SELECT * from users WHERE username = $1 LIMIT 1;";
		return this.getOne(SQL, [username]);
	}
	async getUserFiles (username) {
		const SQL = "SELECT datetime(created,'unixepoch') as created, id, owner, extension FROM files WHERE owner = $1 ORDER BY created desc LIMIT 600;";
		return this.getLots(SQL, [username]);
	}
	getUserByToken (token) {
		const SQL = "SELECT username, token FROM users WHERE token = $1 LIMIT 1;";
		return this.getOne(SQL, [token]);
	}

	// Adds
	addFile (id, extension, userId) {
		const SQL = "INSERT INTO files (id, extension, owner) VALUES ($1, $2, $3)";
		return this.query(SQL, [id, extension, userId]);
	}
	addUser (username, passwordHash) {
		const SQL = "INSERT INTO users (username, password) VALUES ($1, $2)";
		return this.query(SQL, [username, passwordHash]);
	}
	// Link shortener
	addLink (id, url, owner) {
		const SQL = "INSERT INTO links (id, url, owner) VALUES ($1, $2, $3)";
		return this.query(SQL, [id, url, owner]);
	}

	// Removes
	removeFile (id) {
		const SQL = "DELETE FROM files WHERE id = $1";
		return this.query(SQL, [id]);
	}
	removeLink (id) {
		const SQL = "DELETE FROM links WHERE id = $1";
		return this.query(SQL, [id]);
	}
	async removeUser (username) {
		const SQL = "DELETE FROM users WHERE username = $1";
		await this.query(SQL, [username]);
		const removeFilesSQL = "DELETE FROM FILES where owner = $1";
		return this.query(removeFilesSQL, [username]);
	}

	setPassword (username, password) {
		const SQL = "UPDATE users SET password=$1 WHERE username=$2;";
		return this.query(SQL, [password, username]);
	}
	setFilesOwner (oldOwner, newOwner) {
		const SQL = "UPDATE files SET owner=$1 WHERE owner = $2;";
		return this.query(SQL, [newOwner, oldOwner]);
	}
	setToken (username, token) {
		const SQL = "UPDATE users SET token=$1 WHERE username=$2";
		return this.query(SQL, [token, username]);
	}
	expireToken (username) {
		return this.setToken(username, undefined);
	}

}
module.exports = new Database("save-server-database.db");
