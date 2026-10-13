const axios = require('axios');

const { applyCors } = require('./_lib/cors');
const { getDb } = require('./_lib/firebase');
const { handledMethod, sendError } = require('./_lib/http');
const { combineListings, missingAdditionalIds, TOP_COUNT, toResponse } = require('./_lib/listings');

/** Prices are refreshed at most this often (CoinMarketCap credits are limited). */
const FRESH_FOR_MS = 10 * 60 * 1000;

/**
 * Vercel's CDN serves one answer to everyone until it's due for a refresh, and keeps serving it
 * for a while longer while it fetches a new one in the background.
 */
const cacheHeader = (secondsLeft) =>
	`public, max-age=60, s-maxage=${Math.max(60, secondsLeft)}, stale-while-revalidate=300`;
/** Old prices served because CoinMarketCap failed: retry soon. */
const STALE_CACHE = 'public, max-age=30, s-maxage=60';

const coinMarketCapGet = async (path, params) => {
	const apiKey = process.env.CMC_API_KEY;
	if (!apiKey) throw new Error('Missing CMC_API_KEY environment variable');

	const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/${path}`, {
		headers: { 'X-CMC_PRO_API_KEY': apiKey },
		params,
		timeout: 8000,
	});
	return response.data;
};

/** The top coins plus the ones the app always includes, with USD and EUR prices. */
const fetchListings = async (get) => {
	const listing = (convert) =>
		get('cryptocurrency/listings/latest', { convert, limit: TOP_COUNT, start: 1 });
	const [usd, eur] = await Promise.all([listing('USD'), listing('EUR')]);
	const coins = combineListings(usd.data, eur.data);

	const missing = missingAdditionalIds(coins);
	if (missing.length > 0) {
		const quotes = (convert) =>
			get('cryptocurrency/quotes/latest', { convert, id: missing.join(',') });
		const [extraUsd, extraEur] = await Promise.all([quotes('USD'), quotes('EUR')]);
		coins.push(...combineListings(Object.values(extraUsd.data), Object.values(extraEur.data)));
	}

	return coins;
};

/**
 * GET /api/coinmarketcap
 *
 * The latest prices of the top coins in USD and EUR. Refreshed from CoinMarketCap at most every
 * 10 minutes; the last good result is kept in Firestore and served if CoinMarketCap fails.
 */
const createHandler =
	({ coinMarketCap = coinMarketCapGet, getFirestore = getDb, now = () => Date.now() } = {}) =>
	async (req, res) => {
		applyCors(req, res);
		if (handledMethod(req, res)) return;

		let cacheRef = null;
		let cached = null;
		try {
			cacheRef = getFirestore().collection('cachedData').doc('latest');
			const snapshot = await cacheRef.get();
			if (snapshot.exists) cached = snapshot.data();
		} catch (error) {
			console.error('Reading the price cache failed:', error.message);
			cacheRef = null;
		}

		// The current format has `coins`; older cache documents only have the full CoinMarketCap response
		const cachedCoins = Array.isArray(cached?.coins) ? cached.coins : null;
		const age = cachedCoins ? now() - cached.timestamp : Infinity;

		if (cachedCoins && age < FRESH_FOR_MS) {
			res.setHeader('Cache-Control', cacheHeader(Math.floor((FRESH_FOR_MS - age) / 1000)));
			res
				.status(200)
				.json(toResponse(cachedCoins, { updatedAt: new Date(cached.timestamp).toISOString() }));
			return;
		}

		let coins;
		try {
			coins = await fetchListings(coinMarketCap);
			if (coins.length === 0) throw new Error('CoinMarketCap returned no coins');
		} catch (error) {
			console.error('Fetching prices from CoinMarketCap failed:', error.message);

			if (cachedCoins) {
				// Older prices beat an empty dashboard
				res.setHeader('Cache-Control', STALE_CACHE);
				res.status(200).json(
					toResponse(cachedCoins, {
						stale: true,
						updatedAt: new Date(cached.timestamp).toISOString(),
					})
				);
				return;
			}

			sendError(res, 502, 'Could not fetch prices from CoinMarketCap');
			return;
		}

		const timestamp = now();
		if (cacheRef) {
			try {
				await cacheRef.set({ coins, timestamp });
			} catch (error) {
				console.error('Writing the price cache failed:', error.message);
			}
		}

		res.setHeader('Cache-Control', cacheHeader(FRESH_FOR_MS / 1000));
		res.status(200).json(toResponse(coins, { updatedAt: new Date(timestamp).toISOString() }));
	};

module.exports = createHandler();
module.exports.createHandler = createHandler;
