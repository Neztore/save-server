const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./tests",
	timeout: 30000,
	workers: 1,
	fullyParallel: false,
	use: {
		baseURL: "http://localhost:4837",
		headless: true
	},
	projects: [
		{ name: "chromium", use: { browserName: "chromium" } }
	]
});
