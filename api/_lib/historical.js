/** CoinMarketCap's ids for the two currencies the app supports. */
const CONVERT_IDS = new Set([2781 /* USD */, 2790 /* EUR */]);

const HOUR = 3600;
const DAY = 24 * HOUR;
/** Nothing older is useful: there were no crypto prices before then. */
const EARLIEST = Date.UTC(2010, 0, 1) / 1000;
/** Ids are small numbers; this rules out abuse with huge values. */
const MAX_COIN_ID = 1_000_000;

const parseInteger = (value) => {
	if (typeof value !== 'string' || !/^\d{1,12}$/.test(value)) return null;
	return Number(value);
};

/**
 * Checks and normalizes the query of a quote request.
 * The timestamp is rounded down to the hour, so there's a limited number of distinct requests.
 * (Midnight 1 January in Amsterdam, the year-end moment, is exactly on the hour.)
 */
const parseQuoteRequest = (query, nowSeconds) => {
	const coinId = parseInteger(query.coinId ?? '1');
	if (coinId === null || coinId < 1 || coinId > MAX_COIN_ID) {
		return { message: 'coinId must be a positive whole number', ok: false };
	}

	const convertId = parseInteger(query.convertId ?? '2790');
	if (convertId === null || !CONVERT_IDS.has(convertId)) {
		return { message: 'convertId must be 2790 (EUR) or 2781 (USD)', ok: false };
	}

	const requested = parseInteger(query.timestamp ?? String(nowSeconds));
	if (requested === null || requested < EARLIEST || requested > nowSeconds + HOUR) {
		return { message: 'timestamp must be a Unix time in seconds between 2010 and now', ok: false };
	}

	const timestamp = Math.min(requested, nowSeconds) - (Math.min(requested, nowSeconds) % HOUR);
	return {
		coinId,
		convertId,
		/** A quote older than a day won't change anymore */
		isFinal: timestamp < nowSeconds - DAY,
		ok: true,
		timestamp,
	};
};

/** The document id in the historicalQuotes collection. */
const cacheKey = ({ coinId, convertId, timestamp }) => `${coinId}-${convertId}-${timestamp}`;

/** The price in a CoinMarketCap quote-by-timestamp response, or null if there isn't one. */
const extractPrice = (body) => {
	const data = body && typeof body === 'object' ? body.data : null;
	const price = data?.convertQuotes?.[0]?.price ?? data?.quotes?.[0]?.quote?.price;
	return typeof price === 'number' && Number.isFinite(price) && price > 0 ? price : null;
};

module.exports = { cacheKey, extractPrice, parseQuoteRequest };
