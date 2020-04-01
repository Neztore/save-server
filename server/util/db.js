// PostgreSQL database version
// Provides an interface between the database and the application
const { Pool } = require('pg')
const pool = new Pool()

module.exports = {
  query: (text, params) => pool.query(text, params),
  getOne: async function (text, params) {
    const res = await this.query(text, params)
    return res.rows[0]
  },
  // Gets
  async getFile (id) {
    const SQL = 'SELECT * from files WHERE id = $1 LIMIT 1'
    return this.getOne(SQL, [id])
  },
  async getLink (id) {
    const SQL = 'SELECT * from links WHERE id = $1 LIMIT 1'
    return this.getOne(SQL, [id])
  },
  async getFiles (username) {
    const SQL = 'SELECT * from files WHERE files.owner = $1 ORDER BY created DESC LIMIT 600;'
    const s = await this.query(SQL, [username])
    return s.rows
  },
  async getLinks (username) {
    const SQL = 'SELECT * from links WHERE links.owner = $1 ORDER BY created DESC LIMIT 600;'
    const resp = await this.query(SQL, [username])
    return resp.rows
  },
  async getUsers () {
    const SQL = 'SELECT username from users'
    const resp = await this.query(SQL)
    return resp.rows
  },
  async getUser (username) {
    const SQL = 'SELECT * from users WHERE username = $1 LIMIT 1;'
    return this.getOne(SQL, [username])
  },
  async getUserFiles (username) {
    const SQL = 'SELECT * from files WHERE owner = $1;'
    const res = await this.query(SQL, [username])
    return res.rows
  },
  async getUserByToken (token) {
    const SQL = 'SELECT username, token FROM users WHERE token = $1 LIMIT 1;'
    return this.getOne(SQL, [token])
  },

  // Adds
  addFile (id, extension, userId) {
    const SQL = 'INSERT INTO files (id, extension, owner) VALUES ($1, $2, $3)'
    return this.query(SQL, [id, extension, userId])
  },
  addUser (username, passwordHash) {
    const SQL = 'INSERT INTO users (username, password) VALUES ($1, $2)'
    return this.query(SQL, [username, passwordHash])
  },
  // Link shortener
  addLink (id, url, owner) {
    const SQL = 'INSERT INTO links (id, url, owner) VALUES ($1, $2, $3)'
    return this.query(SQL, [id, url, owner])
  },

  // Removes
  removeFile (id) {
    const SQL = 'DELETE FROM files WHERE id = $1'
    return this.query(SQL, [id])
  },
  removeLink (id) {
    const SQL = 'DELETE FROM links WHERE id = $1'
    return this.query(SQL, [id])
  },
  removeUser (username) {
    const SQL = 'DELETE FROM users WHERE username = $1'
    return this.query(SQL, [username])
  },

  async setPassword (username, password) {
    const SQL = 'UPDATE users SET password=$1 WHERE username=$2;'
    return this.query(SQL, [password, username])
  },
  async setFilesOwner (oldOwner, newOwner) {
    const SQL = 'UPDATE files SET owner=$1 WHERE owner = $2;'
    return this.query(SQL, [newOwner, oldOwner])
  },
  setToken (username, token) {
    const SQL = 'UPDATE users SET token=$1 WHERE username=$2'
    return this.query(SQL, [token, username])
  },
  expireToken (username) {
    return this.setToken(username, undefined)
  }

}
