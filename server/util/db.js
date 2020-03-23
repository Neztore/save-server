// PostgreSQL database version
// Provides an interface between the database and the application
const {Pool} = require("pg");
const pool = new Pool();

module.exports = {
    query: (text, params) => pool.query(text, params),

    // Gets
    async getFile(id) {
        const SQL = `SELECT * from files WHERE id = $1 LIMIT 1`;
        const files = await this.query(SQL, [id]);
        return files[0];
    },
    async getLink(id) {
        const SQL = `SELECT * from links WHERE id = $1 LIMIT 1`;
        const s = await this.query(SQL, [id]);
        return s[0];
    },
    async getFiles(ext) {
        // Optional: File extension of files to get todo: (Find out SQL OR/Provide a list of extensions?)
        const SQL = `SELECT * from links WHERE id = $1 LIMIT 1`;
        const s = await this.query(SQL, [id]);
        return s[0];
    },
     getLinks() {
        const SQL = `SELECT * from links`;
        return this.query(SQL, [id]);
    },
    getUsers() {
        const SQL = `SELECT username from users`;
        return this.query(SQL);
    },
    async getUser(username) {
        const SQL = `SELECT * from users WHERE username = $1 LIMIT 1;`;
        const arr = await this.query(SQL, [username]);
        return arr[0];
    },
    async getUserByToken(token) {
        const SQL = "SELECT username, token FROM users WHERE token = $1 LIMIT 1;";
        const users = await this.query(SQL, [token]);
        return users[0];
    },

    // Adds
    addFile (id, extension, userId) {
        const SQL = `INSERT INTO files (id, extension, owner) VALUES ($1, $2, $3)`;
        return this.query(SQL, [id, extension, userId])
    },
    addUser (id, username, passwordHash) {
        const SQL = `INSERT INTO users (username, password) VALUES ($1, S2)`;
        return this.query(SQL, [username, passwordHash]);
    },
    // Link shortener
    addLink (id, url, owner) {
        const SQL = `INSERT INTO links (id, url, owner) VALUES ($1, $2, $3)`
        return this.query(SQL, [id, url, owner])
    },

    // Removes
    removeFile (id) {
        const SQL = `DELETE FROM files WHERE id=$1 LIMIT 1;`;
        return this.query(SQL, [id]);
    },
    removeLink (id) {
        const SQL = `DELETE FROM links WHERE id = $1 LIMIT 1`
        return this.query(SQL, [id])
    },
    removeUser (username){
        const SQL = `DELETE FROM users WHERE username = $1 LIMIT 1`;
        return this.query(SQL, [username]);
    },

    setToken (userId, token) {
        const SQL = `UPDATE users SET token=$1 WHERE id=$2`;
        return this.query(SQL, [token, userId])
    },
    expireToken (userId) {
        return this.setToken(userId, null);
    },


};