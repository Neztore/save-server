let storage = sessionStorage;
let hasStorage = true;

if (!storageAvailable("sessionStorage")) {
	console.error("No session storage support: Your experience will likely be worse because of this.");
	hasStorage = false;
	storage = {};
}

window.Persist = {
	set: function (name, value) {
		if (hasStorage) {
			storage.setObject(name, value);
		} else {
			storage[name] = value;
		}
	},

	get: function (name) {
		if (hasStorage) {
			return storage.getObject(name);
		} else {
			return storage[name];
		}
	},
	remove: function (name) {
		if (hasStorage) {
			return storage.removeItem(name);
		} else {
			storage[name] = undefined;
			return undefined;
		}
	}
};
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable (type) {
	var storage;
	try {
		storage = window[type];
		var x = "__storage_test__";
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch (e) {
		return e instanceof DOMException && (
		// everything except Firefox
			e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === "QuotaExceededError" ||
            // Firefox
            e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
	}
}

Storage.prototype.setObject = function (key, value) {
	this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
};
