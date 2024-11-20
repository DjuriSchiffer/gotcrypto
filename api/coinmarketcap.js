const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const CMC_API_KEY = process.env.CMC_API_KEY;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Define specific cryptocurrencies to always fetch
const ADDITIONAL_COIN_IDS = [
  1,    // Bitcoin
  2,    // Litecoin
  3575, // Gold Ounce
  3574, // Silver Ounce
  1839, // Binance
  1027, // ETH
  5015, // Hex
  825,  // Tether
  52,   // XRP
  2010, // Cardano
  6636,
  5426, // Solana
  3077, // VChain
  74    // Dogecoin
];

const whitelist = [
  'https://gotcrypto.vercel.app'
];

const isAllowedOrigin = (origin) => {
  if (!origin) return false;

  if (whitelist.includes(origin)) {
    return true;
  }

  if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
    return true;
  }

  const vercelPreviewPattern = /^https:\/\/gotcrypto-[a-z0-9]+-djurischiffers-projects\.vercel\.app$/;
  if (vercelPreviewPattern.test(origin)) {
    return true;
  }

  return false;
};

const corsMiddleware = (req, res) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
};

const fetchData = async (currency, params = {}) => {
  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        params: {
          ...params,
          convert: currency,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${currency}:`, error.message);
    throw error;
  }
};

const fetchSpecificCurrencies = async (ids, currency) => {
  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        params: {
          id: ids.join(','),
          convert: currency,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching specific currencies for ${currency}:`, error.message);
    throw error;
  }
};

module.exports = async (req, res) => {
  corsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const docRef = db.collection('cachedData').doc('latest');
    const doc = await docRef.get();
    const now = Date.now();

    if (doc.exists) {
      const data = doc.data();
      const age = now - data.timestamp;
      if (age < CACHE_DURATION) {
        return res.status(200).json(data.apiResponse);
      }
    }

    // Fetch top 100 currencies
    const [usdData, eurData] = await Promise.all([
      fetchData('USD', { start: 1, limit: 100 }),
      fetchData('EUR', { start: 1, limit: 100 }),
    ]);

    // Combine USD and EUR data
    const combinedData = usdData.data.map((coin) => {
      const eurCoin = eurData.data.find((c) => c.id === coin.id);
      return {
        ...coin,
        quote: {
          USD: coin.quote.USD,
          EUR: eurCoin ? eurCoin.quote.EUR : null,
        },
      };
    });

    // Check which additional coins aren't in the top 100
    const existingIds = combinedData.map(coin => coin.id);
    const missingIds = ADDITIONAL_COIN_IDS.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
      const [additionalUsdData, additionalEurData] = await Promise.all([
        fetchSpecificCurrencies(missingIds, 'USD'),
        fetchSpecificCurrencies(missingIds, 'EUR'),
      ]);

      const additionalCoins = Object.values(additionalUsdData.data).map(coin => {
        const eurCoin = additionalEurData.data[coin.id];
        return {
          ...coin,
          quote: {
            USD: coin.quote.USD,
            EUR: eurCoin ? eurCoin.quote.EUR : null,
          },
        };
      });

      combinedData.push(...additionalCoins);
    }

    const apiResponse = {
      status: {
        ...usdData.status,
        credit_count: usdData.status.credit_count + eurData.status.credit_count +
          (missingIds.length > 0 ? 2 : 0),
      },
      data: combinedData,
    };

    // Update cache in Firestore
    await docRef.set({
      apiResponse: apiResponse,
      timestamp: now,
    });

    res.status(200).json(apiResponse);
  } catch (error) {
    console.error('Error fetching CoinMarketCap data:', error.message);
    res.status(500).json({ error: 'Failed to fetch CoinMarketCap data' });
  }
};