const server = require("./server");
const defaults = {
	port: 80,
	// This is the user is configured the first time you run it.
	// This value can be updated to change who is the admin, but this isn't really recommended.
	// The admin user cannot be deleted, and if a user is deleted their files will be moved to the user.
	adminUser: "root",
	// Used to generate bcrypt hashes. You probably don't need to change this.
	hashRounds: 12,
};

module.exports = function (config = defaults) {
	// Maps config.database to node-postgres env variables, see:
	// https://node-postgres.com/features/connecting
	if (config.database) {
		const {
			host,
			port,
			database,
			user,
			password
		} = config.database;
		process.env.PGHOST = host;
		process.env.PGPORT = port;
		process.env.PGDATABASE = database;
		process.env.PGUSER = user;
		process.env.PGPASSWORD = password;
	}
	server(config);
};