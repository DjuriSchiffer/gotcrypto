const fetch = require('node-fetch');

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = Date.now();

  if (cache && now - cacheTime < CACHE_DURATION) {
    console.log('Serving cached data');
    res.status(200).json(cache);
    return;
  }

  try {
    const apiKey = process.env.CMC_API_KEY;
    if (!apiKey) {
      throw new Error('CoinMarketCap API key is not set');
    }

    const apiUrl = new URL(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
    );
    const params = { start: '1', limit: '100', convert: 'USD' };
    Object.keys(params).forEach((key) =>
      apiUrl.searchParams.append(key, params[key])
    );

    const response = await fetch(apiUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `CoinMarketCap API responded with status ${response.status}`
      );
    }

    const data = await response.json();

    // Update cache
    cache = data;
    cacheTime = now;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching CoinMarketCap data:', error.message);
    res.status(500).json({ error: 'Failed to fetch CoinMarketCap data' });
  }
};
