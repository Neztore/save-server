const Api = {};
const BaseUrl = location.origin;
window.BaseUrl = BaseUrl;
const ApiUrl = `${BaseUrl}/api`;

Api.get = function (url, options) {
	if (!options) options = {};
	options.method = "GET";
	return this._makeRequest(url, options);
};

Api.post = function (url, options) {
	try {
		if (!options) options = {};
		options.method = "POST";

		return this._makeRequest(url, options);
	} catch (e) {
		console.error(e);
	}
};

Api.patch = function (url, options) {
	try {
		if (!options) options = {};
		options.method = "PATCH";

		return this._makeRequest(url, options);
	} catch (e) {
		console.error(e);
	}
};

Api.delete = function (url, options) {
	try {
		if (!options) options = {};
		options.method = "DELETE";

		return this._makeRequest(url, options);
	} catch (e) {
		console.error(e);
	}
};
const protectedMethods = ["post", "patch", "delete", "put"]
Api._makeRequest = async function (url, options) {
	const startChar = url.substr(0, 1);
	options.credentials = "include";
	if (!options.headers) options.headers = {};

	if (options.body && typeof options.body !== "string") {
		options.body = JSON.stringify(options.body);
		options.headers["Content-Type"] = "application/json";
	}

	if (protectedMethods.includes(options.method.toLowerCase())) {
		options.headers["CSRF-Token"] = getCookie("CSRF-Token");
	}
	url = (startChar === "/") ? `${ApiUrl}${url}` : `/${url}`;
	const req = await fetch(url, options);
	return await req.json();
};
window.Api = Api;
