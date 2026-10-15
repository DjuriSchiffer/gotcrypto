const axios = require('axios');

const { applyCors } = require('./_lib/cors');
const { getDb } = require('./_lib/firebase');
const { handledMethod, sendError } = require('./_lib/http');
const {
	combineListings,
	creditsThisMonth,
	monthKey,
	selectExtraIds,
	TOP_COUNT,
	toResponse,
	updateTracked,
} = require('./_lib/listings');

/**
 * Prices are refreshed at most this often. Each refresh costs about 4 CoinMarketCap credits, so
 * even with constant traffic a month stays below ~12,000 credits.
 */
const FRESH_FOR_MS = 15 * 60 * 1000;

/** Above this, the function stops refreshing for the rest of the month and serves stored prices. */
const DEFAULT_MONTHLY_CREDIT_BUDGET = 14000;

/**
 * Vercel's CDN serves one answer to everyone until it's due for a refresh, and keeps serving it
 * for a while longer while it fetches a new one in the background.
 */
const cacheHeader = (secondsLeft) =>
	`public, max-age=60, s-maxage=${Math.max(60, secondsLeft)}, stale-while-revalidate=300`;
/** Old prices served because CoinMarketCap failed: retry soon. */
const RETRY_SOON = 'public, max-age=30, s-maxage=60';
/** Old prices served because the credit budget is used up: no point retrying often. */
const RETRY_LATER = 'public, max-age=300, s-maxage=1800';

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

const monthlyBudget = () => {
	const value = Number(process.env.CMC_MONTHLY_CREDIT_BUDGET);
	return Number.isFinite(value) && value > 0 ? value : DEFAULT_MONTHLY_CREDIT_BUDGET;
};

/** Credits a response cost, as CoinMarketCap reports it (1 if it doesn't say). */
const creditsOf = (body) => {
	const count = body?.status?.credit_count;
	return typeof count === 'number' && count >= 0 ? count : 1;
};

/**
 * The top coins plus the extra ones, with USD and EUR prices.
 * `meter.credits` counts what every successful call cost, also when a later call fails.
 */
const fetchListings = async (get, tracked, meter) => {
	const call = async (path, params) => {
		const body = await get(path, params);
		meter.credits += creditsOf(body);
		return body;
	};

	const listing = (convert) => call('cryptocurrency/listings/latest', { convert, limit: TOP_COUNT, start: 1 });
	const [usd, eur] = await Promise.all([listing('USD'), listing('EUR')]);
	const coins = combineListings(usd.data, eur.data);

	const extraIds = selectExtraIds(coins.map((coin) => coin.id), tracked);
	if (extraIds.length > 0) {
		// skip_invalid: a delisted id would otherwise make CoinMarketCap reject the whole request
		const quotes = (convert) =>
			call('cryptocurrency/quotes/latest', { convert, id: extraIds.join(','), skip_invalid: true });
		const [extraUsd, extraEur] = await Promise.all([quotes('USD'), quotes('EUR')]);
		coins.push(...combineListings(Object.values(extraUsd.data ?? {}), Object.values(extraEur.data ?? {})));
	}

	return coins;
};

/**
 * GET /api/coinmarketcap
 *
 * The latest prices of the top coins and of every coin that has been on the list before, in USD
 * and EUR. Refreshed at most every 15 minutes and within a monthly credit budget; the last good
 * result is kept in Firestore and served whenever a refresh isn't possible.
 */
const createHandler =
	({
		budget = monthlyBudget,
		coinMarketCap = coinMarketCapGet,
		getFirestore = getDb,
		now = () => Date.now(),
	} = {}) =>
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
		const serveCached = (cacheControl, stale) => {
			res.setHeader('Cache-Control', cacheControl);
			res.status(200).json(toResponse(cachedCoins, { stale, updatedAt: new Date(cached.timestamp).toISOString() }));
		};

		if (cachedCoins && age < FRESH_FOR_MS) {
			serveCached(cacheHeader(Math.floor((FRESH_FOR_MS - age) / 1000)), false);
			return;
		}

		const used = creditsThisMonth(cached?.credits, now());
		if (used >= budget()) {
			console.warn(`CoinMarketCap credit budget reached (${used} this month); serving stored prices`);
			if (cachedCoins) {
				serveCached(RETRY_LATER, true);
				return;
			}
			sendError(res, 503, 'Prices are temporarily unavailable');
			return;
		}

		const tracked = cached?.tracked ?? {};
		const meter = { credits: 0 };
		const creditsAfter = () => ({ month: monthKey(now()), used: used + meter.credits });
		let coins;
		try {
			coins = await fetchListings(coinMarketCap, tracked, meter);
			if (coins.length === 0) throw new Error('CoinMarketCap returned no coins');
		} catch (error) {
			console.error('Fetching prices from CoinMarketCap failed:', error.message);

			// Calls that succeeded before the failure still cost credits: record them
			if (cacheRef && meter.credits > 0) {
				try {
					await cacheRef.set({ credits: creditsAfter() }, { merge: true });
				} catch (writeError) {
					console.error('Recording used credits failed:', writeError.message);
				}
			}

			if (cachedCoins) {
				// Older prices beat an empty dashboard
				serveCached(RETRY_SOON, true);
				return;
			}
			sendError(res, 502, 'Could not fetch prices from CoinMarketCap');
			return;
		}

		const timestamp = now();
		if (cacheRef) {
			try {
				await cacheRef.set({
					coins,
					credits: creditsAfter(),
					timestamp,
					tracked: updateTracked(tracked, coins.map((coin) => coin.id), timestamp),
				});
			} catch (error) {
				console.error('Writing the price cache failed:', error.message);
			}
		}

		res.setHeader('Cache-Control', cacheHeader(FRESH_FOR_MS / 1000));
		res.status(200).json(toResponse(coins, { updatedAt: new Date(timestamp).toISOString() }));
	};

module.exports = createHandler();
module.exports.createHandler = createHandler;