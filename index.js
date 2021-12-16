const saveServer = require("./server/index");
// If run directly (i.e. through "npm start")
if (require.main === module) {
	saveServer(process.env.port || 80);
}
module.exports = function (port) {
	const portToUse = port || process.env.port || 80;

	saveServer(portToUse);
};
