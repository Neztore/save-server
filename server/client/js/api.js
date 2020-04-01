const Api = {};
const BaseUrl = location.origin;
const ApiUrl = `${BaseUrl}/api`;

Api.get = function (url, options) {
    if (!options) options = {};
    options.method = "GET";
    return this._makeRequest(url, options)
};

Api.post = function (url, options) {
    try {
        if (!options) options = {};
        options.method = "POST";

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

        return this._makeRequest(url, options)
    } catch (e) {
        console.error(e)
    }
};


Api._makeRequest = async function (url, options) {
    const startChar = url.substr(0, 1);
    options.credentials = "include";

    url = (startChar === '/') ? `${ApiUrl}${url}` : `/${url}`;
    const req = await fetch(url, options);
    return await req.json()
};
