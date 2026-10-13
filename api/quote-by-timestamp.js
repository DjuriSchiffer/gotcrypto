const axios = require('axios');

const { applyCors } = require('./_lib/cors');
const { getDb } = require('./_lib/firebase');
const { cacheKey, extractPrice, parseQuoteRequest } = require('./_lib/historical');
const { handledMethod, sendError } = require('./_lib/http');

const COLLECTION = 'historicalQuotes';

/** A past quote never changes: let Vercel's CDN keep it for a year, and browsers for a day. */
const FINAL_CACHE = 'public, max-age=86400, s-maxage=31536000, immutable';
/** A quote from the last day can still change. */
const RECENT_CACHE = 'public, max-age=60, s-maxage=300';

const fetchFromCoinMarketCap = async ({ coinId, convertId, timestamp }) => {
	const response = await axios.get(
		'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/quote-by-timestamp',
		{ params: { convertId, id: coinId, timestamp }, timeout: 8000 }
	);
	return response.data;
};

/**
 * GET /api/quote-by-timestamp?coinId=1&convertId=2790&timestamp=1704063600
 *
 * Returns CoinMarketCap's quote for a coin at a moment in time. Final quotes are stored in
 * Firestore (one document each) and cached by the CDN, so each is fetched from CoinMarketCap once.
 */
const createHandler =
	({ fetchQuote = fetchFromCoinMarketCap, getFirestore = getDb, now = () => Date.now() } = {}) =>
	async (req, res) => {
		applyCors(req, res);
		if (handledMethod(req, res)) return;

		const request = parseQuoteRequest(req.query ?? {}, Math.floor(now() / 1000));
		if (!request.ok) {
			sendError(res, 400, request.message);
			return;
		}

		let cacheRef = null;
		if (request.isFinal) {
			try {
				cacheRef = getFirestore().collection(COLLECTION).doc(cacheKey(request));
				const cached = await cacheRef.get();
				if (cached.exists) {
					res.setHeader('Cache-Control', FINAL_CACHE);
					res.status(200).json(cached.data().response);
					return;
				}
			} catch (error) {
				// The cache is an optimization: carry on without it
				console.error('Reading the quote cache failed:', error.message);
				cacheRef = null;
			}
		}

		let body;
		try {
			body = await fetchQuote(request);
		} catch (error) {
			console.error(`CoinMarketCap request failed for ${cacheKey(request)}:`, error.message);
			sendError(res, 502, 'Could not reach CoinMarketCap');
			return;
		}

		if (extractPrice(body) === null) {
			// Don't cache this: it may be a temporary problem, or an unknown coin
			sendError(res, 404, 'No price available for this coin at this time');
			return;
		}

		if (cacheRef) {
			try {
				await cacheRef.set({ fetchedAt: new Date(now()).toISOString(), response: body });
			} catch (error) {
				console.error('Writing the quote cache failed:', error.message);
			}
		}

		res.setHeader('Cache-Control', request.isFinal ? FINAL_CACHE : RECENT_CACHE);
		res.status(200).json(body);
	};

module.exports = createHandler();
module.exports.createHandler = createHandler;
