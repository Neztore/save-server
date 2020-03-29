const Api = {};
const BaseUrl = location.origin;

Api.get = function (url, options) {
    if (!options) options = {};
    options.method = "GET";
    return this._makeRequest(url, options)
};

Api.post = function (url, options) {
    try {
        if (!options) options = {};
        options.method = "POST";
        options.credentials = "include";

        // POST Body processing
        if (options.body && typeof options.body !== "string") {
            options.body = JSON.stringify(options.body);
            if (!options.headers) options.headers = {};
            options.headers["Content-Type"] = "application/json"
        }

        return this._makeRequest(url, options)
    } catch (e) {
        console.error(e)
    }
};

Api.patch = function (url, options) {
    try {
        if (!options) options = {}
        options.method = "PATCH";
        options.credentials = "include"
        options.headers.authorization = getCookie("authorization");

        // PATCH Body processing
        if (options.body && typeof options.body !== "string") {
            options.body = JSON.stringify(options.body);
            if (!options.headers) options.headers = {};
            options.headers["Content-Type"] = "application/json"
        }

        return this._makeRequest(url, options)
    } catch (e) {
        console.error(e);
    }
};

Api.delete = function (url, options) {
    try {
        if (!options) options = {};
        options.method = "DELETE";
        options.credentials = "include";

        return this._makeRequest(url, options)
    } catch (e) {
        console.error(e)
    }
};


Api._makeRequest = async function (url, options) {
    const startChar = url.substr(0, 1);
    options.credentials = "include";

    url = (startChar === '/') ? `${BaseUrl}${url}` : `/${url}`;
    const req = await fetch(url, options);
    return await req.json()
};
