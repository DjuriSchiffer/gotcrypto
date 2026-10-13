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

/** The ids from ADDITIONAL_COIN_IDS that the top list doesn't include yet. */
const missingAdditionalIds = (coins) => {
	const present = new Set(coins.map((coin) => coin.id));
	return ADDITIONAL_COIN_IDS.filter((id) => !present.has(id));
};

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
	missingAdditionalIds,
	TOP_COUNT,
	toResponse,
};
