const { errorGenerator } = require("../util/errors");

// limitNo: The number of requests that can be made per "timePer". By default this is per minute.
// timePer (Seconds): The time for rate limit bucket to last

// Rate limiting is based on wherever it's called
module.exports = function makeMiddleware(limitNo = 60, timePer = 60) {
	const bucket = new Map();
	addAutoClear(bucket);

	return function rateLimit(req, res, next) {
		const ip = getIp(req);

		const userLimit = bucket.get(ip);
		if (userLimit) {
			// Check times
			const timeSince = Date.now() - userLimit.first;
			if (timeSince < timePer * 1000) {
				// Check count
				if (userLimit.no + 1 > limitNo) {
					// Rate limit hit. Ouch!
					// Tell them to cool it. As they've hit a cooldown, give a timeout.
					increment(bucket, ip);
					const retryAfter = (timePer * 1000) - timeSince;
					res.set("Retry-After", retryAfter);
					console.log(`Excessive requests. ${userLimit.no} - ${ip}: ${req.user ? req.user.username : "Unauthenticated"}`);

					return res.status(429).send(errorGenerator(429, "Too many requests. Slow down!", { retryAfter }));
				}
				increment(bucket, ip);
			} else {
				// It's expired
				bucket.delete(ip);
				increment(bucket, ip);
			}
		} else {
			increment(bucket, ip);
		}
		return next();
	};
};

function increment(bucket, ip) {
	const curr = bucket.get(ip);
	if (curr) {
		bucket.set(ip, {
			no: curr.no + 1,
			first: curr.first
		});
	} else {
		bucket.set(ip, {
			no: 1,
			first: Date.now()
		});
	}
}

// Check for out of date every 10 minutes
const buckets = [];
const addAutoClear = i => buckets.push(i);
setInterval(() => {
	for (const bucket of buckets) {
		// If it's more than 10 minutes remove
		bucket.forEach((value, key) => {
			if (Date.now() - value.start > 600000) {
				bucket.delete(key);
			}
		});
	}
}, 600000);

function getIp(req) {
	const ip = req.get("CF-Connecting-IP");
	if (!ip) {
		if (process.env.NODE_ENV === "production" && process.env.cloudflare_limiting === "true") {
			throw new Error("No Cloudflare IP available");
		} else {
			return req.ip;
		}
	}
	return ip;
}
