const axios = require('axios');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            projectId: process.env.FIREBASE_PROJECT_ID,
        }),
    });
}

const db = admin.firestore();

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
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, sentry-trace, baggage'
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
    }
};

let browserCache = {};

module.exports = async (req, res) => {
    corsMiddleware(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { coinId = 1, convertId = 2790, timestamp = Math.floor(Date.now() / 1000) } = req.query;

    try {
        const cacheKey = `${coinId}-${convertId}-${timestamp}`;

        if (browserCache[cacheKey]) {
            return res.status(200).json(browserCache[cacheKey]);
        }

        const docRef = db.collection('cachedData').doc('historical');
        const doc = await docRef.get();

        if (doc.exists) {
            const cachedData = doc.data();
            if (cachedData && cachedData[cacheKey]) {
                console.log(`Retrieved cached data for ${cacheKey}`);
                return res.status(200).json(cachedData[cacheKey]);
            }
        }

        const response = await axios.get(
            `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/quote-by-timestamp`,
            {
                params: {
                    convertId: convertId,
                    id: coinId,
                    timestamp: timestamp
                }
            }
        );


        const dataToCache = response.data;

        browserCache[cacheKey] = dataToCache;

        const updateData = {};
        updateData[cacheKey] = dataToCache;


        await docRef.set(updateData, { merge: true });

        console.log(`Stored new data in cache for ${cacheKey}`);


        res.status(200).json(dataToCache);
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error.message);

        res.status(500).json({
            data: null,
            error: 'Failed to fetch cryptocurrency data',
            status: {
                credit_count: 0,
                elapsed: 0,
                error_code: 500,
                error_message: error.message || 'Failed to fetch cryptocurrency data',
                timestamp: new Date().toISOString()
            }
        });
    }
};