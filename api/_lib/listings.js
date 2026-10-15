/** Coins that are always included, even when they fall outside the top 100. */
const ADDITIONAL_COIN_IDS = [
	1, // Bitcoin
	2, // Litecoin
	52, // XRP
	74, // Dogecoin
	825, // Tether
	1027, // Ethereum
	1839, // BNB
	2010, // Cardano
	3077, // VeChain
	3574, // Silver ounce
	3575, // Gold ounce
	5015, // HEX
	5426, // Solana
	6636, // Polkadot
];

const TOP_COUNT = 100;

/**
 * At most this many coins outside the top list are fetched. CoinMarketCap charges 1 credit per
 * 100 coins per quotes request, so staying within 100 keeps the cost at 1 credit per currency.
 */
const MAX_EXTRA_COINS = 100;

/** A remembered coin without a price for this long is considered delisted and forgotten. */
const FORGET_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

const priceOf = (coin, currency) => {
	const price = coin?.quote?.[currency]?.price;
	return typeof price === 'number' && Number.isFinite(price) ? price : null;
};

/**
 * Combines CoinMarketCap's USD and EUR data into the fields the app uses.
 * A coin without a price in both currencies is left out: the app would break on it.
 */
const combineListings = (usdCoins, eurCoins) => {
	const eurById = new Map(eurCoins.map((coin) => [coin.id, coin]));
	const combined = [];

	for (const coin of usdCoins) {
		const usd = priceOf(coin, 'USD');
		const eur = priceOf(eurById.get(coin.id), 'EUR');
		if (usd === null || eur === null) continue;

		combined.push({
			cmc_rank: typeof coin.cmc_rank === 'number' ? coin.cmc_rank : null,
			id: coin.id,
			name: coin.name,
			quote: { EUR: { price: eur }, USD: { price: usd } },
			slug: coin.slug,
		});
	}

	return combined;
};

/**
 * Which coins outside the top list to fetch: the always-included coins first, then remembered
 * coins, most recently priced first, up to MAX_EXTRA_COINS.
 *
 * `tracked` maps a coin id to the last time it had a price (ms).
 */
const selectExtraIds = (topIds, tracked) => {
	const inTop = new Set(topIds);
	const always = ADDITIONAL_COIN_IDS.filter((id) => !inTop.has(id));
	const remembered = Object.entries(tracked)
		.map(([id, lastPriced]) => ({ id: Number(id), lastPriced }))
		.filter(({ id }) => !inTop.has(id) && !always.includes(id))
		.sort((a, b) => b.lastPriced - a.lastPriced)
		.map(({ id }) => id);

	return [...always, ...remembered].slice(0, MAX_EXTRA_COINS);
};

/**
 * "Once listed, always listed": remembers every coin that had a price, so a coin that falls out
 * of the top list keeps its price for the people holding it. A coin without a price for
 * FORGET_AFTER_MS is dropped (it was delisted, or pushed out by the cap).
 */
const updateTracked = (tracked, pricedIds, now) => {
	const next = {};
	for (const [id, lastPriced] of Object.entries(tracked)) {
		if (now - lastPriced < FORGET_AFTER_MS) next[id] = lastPriced;
	}
	for (const id of pricedIds) next[id] = now;
	return next;
};

/** "2026-10": credits are budgeted per calendar month (UTC), like CoinMarketCap counts them. */
const monthKey = (now) => new Date(now).toISOString().slice(0, 7);

/** Credits used this month, starting from zero in a new month. */
const creditsThisMonth = (credits, now) =>
	credits && credits.month === monthKey(now) ? credits.used : 0;

/** The response the frontend expects: CoinMarketCap's format, with error_code 0 on success. */
const toResponse = (coins, { stale = false, updatedAt }) => ({
	data: coins,
	status: {
		error_code: 0,
		error_message: null,
		stale,
		timestamp: updatedAt,
	},
});

module.exports = {
	ADDITIONAL_COIN_IDS,
	combineListings,
	creditsThisMonth,
	FORGET_AFTER_MS,
	MAX_EXTRA_COINS,
	monthKey,
	selectExtraIds,
	TOP_COUNT,
	toResponse,
	updateTracked,
};
