const axios = require('axios');

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
    data: null,
    timestamp: 0
};

module.exports = async (req, res) => {
    const origin = req.headers.origin;
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

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { coinId = 1, convertId = 2790, timestamp = Math.floor(Date.now() / 1000) } = req.query;

    try {
        const cacheKey = `${coinId}-${convertId}-${timestamp}`;

        if (cache.data && cache.data[cacheKey] && (Date.now() - cache.timestamp) < CACHE_DURATION) {
            return res.status(200).json(cache.data[cacheKey]);
        }

        const response = await axios.get(
            `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/quote-by-timestamp`,
            {
                params: {
                    id: coinId,
                    convertId: convertId,
                    timestamp: timestamp
                }
            }
        );

        if (!cache.data) {
            cache.data = {};
        }
        cache.data[cacheKey] = response.data;
        cache.timestamp = Date.now();

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error.message);

        res.status(500).json({
            data: null,
            status: {
                timestamp: new Date().toISOString(),
                error_code: 500,
                error_message: error.message || 'Failed to fetch cryptocurrency data',
                elapsed: 0,
                credit_count: 0
            },
            error: 'Failed to fetch cryptocurrency data'
        });
    }
};