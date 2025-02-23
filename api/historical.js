// api/historical.js
const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (reusing your existing initialization)
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
const HISTORICAL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Reuse your existing CORS setup
const whitelist = ['https://gotcrypto.vercel.app'];

const isAllowedOrigin = (origin) => {
    if (!origin) return false;
    if (whitelist.includes(origin)) return true;
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) return true;
    const vercelPreviewPattern = /^https:\/\/gotcrypto-[a-z0-9]+-djurischiffers-projects\.vercel\.app$/;
    return vercelPreviewPattern.test(origin);
};

const corsMiddleware = (req, res) => {
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, sentry-trace, baggage');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
    }
};

const fetchHistoricalData = async (id, startDate, endDate, currency) => {
    try {
        const response = await axios.get(
            'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                },
                params: {
                    id,
                    time_start: startDate,
                    time_end: endDate,
                    interval: '1d',
                    convert: currency,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching historical data for ${currency}:`, error.message);
        throw error;
    }
};

module.exports = async (req, res) => {
    corsMiddleware(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id, start_date, end_date } = req.query;

    if (!id || !start_date || !end_date) {
        return res.status(400).json({
            status: {
                error_code: 400,
                error_message: 'Missing required parameters'
            }
        });
    }

    try {
        // Check cache first
        const cacheKey = `historical-${id}-${start_date}-${end_date}`;
        const docRef = db.collection('historicalData').doc(cacheKey);
        const doc = await docRef.get();
        const now = Date.now();

        if (doc.exists) {
            const data = doc.data();
            const age = now - data.timestamp;
            if (age < HISTORICAL_CACHE_DURATION) {
                return res.status(200).json(data.apiResponse);
            }
        }

        // Fetch fresh data for both currencies
        const [usdData, eurData] = await Promise.all([
            fetchHistoricalData(id, start_date, end_date, 'USD'),
            fetchHistoricalData(id, start_date, end_date, 'EUR')
        ]);

        // Combine the data (following your pattern from the regular endpoint)
        const quotes = usdData.data[id].quotes.map(quote => {
            const eurQuote = eurData.data[id].quotes.find(
                q => q.timestamp === quote.timestamp
            );

            return {
                timestamp: quote.timestamp,
                quote: {
                    USD: quote.quote.USD,
                    EUR: eurQuote ? eurQuote.quote.EUR : null
                }
            };
        });

        const apiResponse = {
            status: {
                ...usdData.status,
                credit_count: usdData.status.credit_count + eurData.status.credit_count
            },
            data: {
                [id]: {
                    quotes
                }
            }
        };

        await docRef.set({
            apiResponse,
            timestamp: now
        });

        res.status(200).json(apiResponse);
    } catch (error) {
        console.error('Error fetching historical data:', error.message);
        res.status(500).json({
            status: {
                error_code: 500,
                error_message: 'Failed to fetch historical data'
            }
        });
    }
};