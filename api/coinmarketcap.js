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

// Configuration
const CMC_API_KEY = process.env.CMC_API_KEY;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust for better security
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // Fetch fresh data from CoinMarketCap API
    console.log('Fetching fresh data from CoinMarketCap API');
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        params: {
          start: 1,
          limit: 100,
          convert: 'USD',
        },
      }
    );

    const apiData = response.data;

    // Update cache in Firestore
    await docRef.set({
      apiResponse: apiData,
      timestamp: now,
    });

    // Serve the fresh data
    res.status(200).json(apiData);
  } catch (error) {
    console.error('Error fetching CoinMarketCap data:', error.message);
    res.status(500).json({ error: 'Failed to fetch CoinMarketCap data' });
  }
};
