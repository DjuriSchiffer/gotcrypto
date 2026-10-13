/**
 * An error in the shape the frontend already understands: CoinMarketCap's own response format,
 * with `data: null`. `status` is the HTTP status code.
 */
const sendError = (res, status, message) => {
	res.setHeader('Cache-Control', 'no-store');
	res.status(status).json({
		data: null,
		error: message,
		status: {
			credit_count: 0,
			elapsed: 0,
			error_code: status,
			error_message: message,
			timestamp: new Date().toISOString(),
		},
	});
};

/**
 * Handles CORS preflight and anything that isn't a GET.
 * Returns true when the request has been answered.
 */
const handledMethod = (req, res) => {
	if (req.method === 'OPTIONS') {
		res.status(204).end();
		return true;
	}
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET, OPTIONS');
		sendError(res, 405, 'Method not allowed');
		return true;
	}
	return false;
};

module.exports = { handledMethod, sendError };
