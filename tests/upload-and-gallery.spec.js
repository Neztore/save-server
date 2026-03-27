const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const http = require("http");
const sqlite3 = require("sqlite3");

const PORT = 4837;
const BASE = `http://localhost:${PORT}`;
const DEFAULT_PASSWORD = "saveServerRoot";
const DEFAULT_USER = "root";

// Enough images to push content below a short viewport.
// 4 columns (is-3), each row ~17.5vw tall. At 800px wide that's ~140px/row.
// 12 images = 3 rows = ~420px of content, past a 200px viewport.
// Stays within the 15-per-minute upload rate limit.
const IMAGE_COUNT = 12;

let server;

// Generate a tiny valid PNG buffer (1x1 pixel, red)
function makePng() {
	return Buffer.from(
		"89504e470d0a1a0a0000000d494844520000000100000001080200" +
		"0000907753de0000000c4944415408d76360f8cf00000001010048" +
		"b11a3e0000000049454e44ae426082",
		"hex"
	);
}

// Initialize the SQLite database with the schema from create.sql
function initDatabase(dbPath) {
	return new Promise((resolve, reject) => {
		const schemaPath = path.join(__dirname, "..", "create.sql");
		const schema = fs.readFileSync(schemaPath, "utf8");
		const db = new sqlite3.Database(dbPath, (err) => {
			if (err) return reject(err);
			db.exec(schema, (err) => {
				if (err) return reject(err);
				db.close((err) => {
					if (err) return reject(err);
					resolve();
				});
			});
		});
	});
}

// Helper: extract a named cookie value from set-cookie header(s)
function extractCookie(headers, name) {
	const raw = headers["set-cookie"];
	if (!raw) return null;
	const lines = Array.isArray(raw) ? raw : raw.split("\n");
	for (const line of lines) {
		const match = line.match(new RegExp(`${name}=([^;]+)`));
		if (match) return match[1];
	}
	return null;
}

// Helper: get a CSRF token by making a GET request
async function getCsrfToken(request) {
	const res = await request.get(`${BASE}/login`);
	expect(res.status()).toBe(200);
	return extractCookie(res.headers(), "CSRF-Token");
}

// Helper: log in as root and return the auth cookie value
async function login(request) {
	const csrfToken = await getCsrfToken(request);
	expect(csrfToken).toBeTruthy();

	const res = await request.post(`${BASE}/api/users/login`, {
		headers: {
			"Content-Type": "application/json",
			"CSRF-Token": csrfToken,
			Cookie: `CSRF-Token=${csrfToken}`
		},
		data: JSON.stringify({ username: DEFAULT_USER, password: DEFAULT_PASSWORD })
	});
	expect(res.status()).toBe(200);

	const authToken = extractCookie(res.headers(), "authorization");
	expect(authToken).toBeTruthy();
	return authToken;
}

// Helper: upload a PNG image via the API (like ShareX does)
async function uploadImage(request, authToken, index) {
	const png = makePng();
	const boundary = "----TestBoundary" + index;
	const filename = `test_image_${index}.png`;

	const body = Buffer.concat([
		Buffer.from(
			`--${boundary}\r\n` +
			`Content-Disposition: form-data; name="files"; filename="${filename}"\r\n` +
			"Content-Type: image/png\r\n\r\n"
		),
		png,
		Buffer.from(`\r\n--${boundary}--\r\n`)
	]);

	const res = await request.post(`${BASE}/api/files`, {
		headers: {
			Authorization: authToken,
			"Content-Type": `multipart/form-data; boundary=${boundary}`
		},
		data: body
	});
	expect(res.status()).toBe(200);
	const json = await res.json();
	expect(json.url).toBeTruthy();
	return json.url;
}

// Helper: set auth cookie and navigate to dashboard with a given viewport
async function goToDashboard(page, authToken, viewportHeight) {
	await page.context().addCookies([{
		name: "authorization",
		value: authToken,
		url: BASE
	}]);
	if (viewportHeight) {
		await page.setViewportSize({ width: 800, height: viewportHeight });
	}
	await page.goto(`${BASE}/dashboard`);
	await page.waitForSelector(".outerBox", { timeout: 10000 });
}

test.beforeAll(async () => {
	const dbPath = path.join(__dirname, "..", "server", "util", "save-server-database.db");
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
	await initDatabase(dbPath);

	const uploadsDir = path.join(__dirname, "..", "uploads");
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir);
	}

	const startServer = require("../server/index");
	server = startServer(PORT);

	// Wait for the server to be ready and the root user to be created
	await new Promise((resolve, reject) => {
		const maxAttempts = 40;
		let attempts = 0;
		const interval = setInterval(() => {
			attempts++;
			const req = http.get(`${BASE}/`, (res) => {
				res.resume();
				if (res.statusCode === 200) {
					clearInterval(interval);
					setTimeout(resolve, 500);
				}
			});
			req.on("error", () => {
				if (attempts >= maxAttempts) {
					clearInterval(interval);
					reject(new Error("Server did not start in time"));
				}
			});
		}, 250);
	});
});

test.afterAll(async () => {
	if (server) {
		await new Promise((resolve) => server.close(resolve));
	}
	const uploadsDir = path.join(__dirname, "..", "uploads");
	if (fs.existsSync(uploadsDir)) {
		for (const file of fs.readdirSync(uploadsDir)) {
			if (file.startsWith(".")) continue;
			fs.unlinkSync(path.join(uploadsDir, file));
		}
	}
});

test.describe.serial("Photo upload and lazy-load gallery", () => {
	let authToken;
	const uploadedUrls = [];

	test("upload multiple images via API", async ({ request }) => {
		authToken = await login(request);
		for (let i = 0; i < IMAGE_COUNT; i++) {
			const url = await uploadImage(request, authToken, i);
			uploadedUrls.push(url);
		}
		expect(uploadedUrls).toHaveLength(IMAGE_COUNT);
	});

	test("uploaded images are accessible with cache headers", async ({ request }) => {
		for (const url of uploadedUrls) {
			const res = await request.get(url);
			expect(res.status()).toBe(200);
			expect(res.headers()["content-type"]).toContain("image/png");
			expect(res.headers()["cache-control"]).toContain("max-age=604800");
		}
	});

	test("dashboard shows all uploaded images in gallery", async ({ page }) => {
		await goToDashboard(page, authToken);
		const items = await page.locator("#gallery .outerBox").count();
		expect(items).toBe(IMAGE_COUNT);
	});

	test("images above the fold load, images below the fold are deferred", async ({ page }) => {
		// Use a very short viewport so only the first row or two are visible.
		// rootMargin is 200px, viewport is 200px, so observer triggers up to ~400px.
		// Each row is ~17.5vw = ~140px at 800px width. So ~2-3 rows load eagerly.
		await goToDashboard(page, authToken, 200);
		await page.waitForTimeout(500);

		const boxes = page.locator("#gallery .file-box");
		const count = await boxes.count();
		expect(count).toBe(IMAGE_COUNT);

		const { loaded, pending } = await boxes.evaluateAll((els) => {
			let loaded = 0, pending = 0;
			for (const el of els) {
				if (el.style.backgroundImage && el.style.backgroundImage !== "" && el.style.backgroundImage !== "none") {
					loaded++;
				}
				if (el.getAttribute("data-bg")) {
					pending++;
				}
			}
			return { loaded, pending };
		});

		// Some should be loaded (visible + rootMargin) and some still deferred
		expect(loaded).toBeGreaterThan(0);
		expect(pending).toBeGreaterThan(0);
		expect(loaded + pending).toBe(IMAGE_COUNT);
	});

	test("scrolling to bottom loads all remaining images", async ({ page }) => {
		await goToDashboard(page, authToken, 200);
		await page.waitForTimeout(500);

		// Count initially loaded
		const initialLoaded = await page.locator("#gallery .file-box").evaluateAll(
			(els) => els.filter((el) => el.style.backgroundImage && el.style.backgroundImage !== "none" && el.style.backgroundImage !== "").length
		);

		// Scroll incrementally to the bottom
		const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
		for (let y = 0; y <= scrollHeight; y += 100) {
			await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
			await page.waitForTimeout(50);
		}
		await page.waitForTimeout(500);

		// After scrolling, more images should have loaded
		const afterLoaded = await page.locator("#gallery .file-box").evaluateAll(
			(els) => els.filter((el) => el.style.backgroundImage && el.style.backgroundImage !== "none" && el.style.backgroundImage !== "").length
		);
		expect(afterLoaded).toBeGreaterThan(initialLoaded);

		// All images should now be loaded (no data-bg remaining)
		const remaining = await page.locator("#gallery .file-box[data-bg]").count();
		expect(remaining).toBe(0);
	});
});
