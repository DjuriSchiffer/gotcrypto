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
        console.log('Serving cached data from Firestore');
        return res.status(200).json(data.apiResponse);
      }
    }

    const fetchData = async (currency) => {
      try {
        const response = await axios.get(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
          {
            headers: {
              'X-CMC_PRO_API_KEY': CMC_API_KEY,
            },
            params: {
              start: 1,
              limit: 100,
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

    const [usdData, eurData] = await Promise.all([
      fetchData('USD'),
      fetchData('EUR'),
    ]);

    const combinedData = usdData.data.map((coin, index) => {
      const eurCoin = eurData.data.find((c) => c.id === coin.id);
      return {
        ...coin,
        quote: {
          USD: coin.quote.USD,
          EUR: eurCoin ? eurCoin.quote.EUR : null,
        },
      };
    });

    const apiResponse = {
      status: {
        ...usdData.status,
        credit_count: usdData.status.credit_count + eurData.status.credit_count,
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