module.exports = {
	"env": {
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",

	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 8
	},
	"rules": {
		"no-unused-vars": ["warn", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
		"indent": [
			"error",
			"tab"
		],
		"no-console": "off",

		"semi": [
			"error",
			"always"
		]
	}
};
