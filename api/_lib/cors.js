const PRODUCTION_ORIGIN = 'https://gotcrypto.nl';
const VERCEL_PRODUCTION_ORIGIN = 'https://gotcrypto.vercel.app';
const PREVIEW_ORIGIN = /^https:\/\/gotcrypto-[a-z0-9-]+-djurischiffers-projects\.vercel\.app$/;
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

/** The app itself, its Vercel preview deployments, and local development. */
const isAllowedOrigin = (origin) =>
	typeof origin === 'string' &&
	(origin === PRODUCTION_ORIGIN ||
		origin === VERCEL_PRODUCTION_ORIGIN ||
		PREVIEW_ORIGIN.test(origin) ||
		LOCAL_ORIGIN.test(origin));

/**
 * Sets the CORS headers. Note that CORS only limits which websites can read the response in a
 * browser; it doesn't stop anyone calling the API directly, so input is validated separately.
 */
const applyCors = (req, res) => {
	// The response depends on the Origin header, so caches must store it per origin
	res.setHeader('Vary', 'Origin');

	const { origin } = req.headers;
	if (isAllowedOrigin(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, sentry-trace, baggage');
		res.setHeader('Access-Control-Max-Age', '86400');
	}
};

module.exports = { applyCors, isAllowedOrigin };
