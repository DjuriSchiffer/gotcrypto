/**
 * "Data provided by CoinMarketCap.com", with a link: required by CoinMarketCap's API terms
 * wherever their data is shown. Rendered once by App, fixed in the bottom-right corner of every
 * screen. Text only: their terms don't allow using the logo.
 */
function CoinMarketCapAttribution() {
	return (
		<p className="pointer-events-auto fixed bottom-2 right-3 z-30 rounded-md bg-white/80 px-2 py-1 text-xs text-gray-500 shadow-sm backdrop-blur dark:bg-gray-800/80 dark:text-gray-400">
			Data provided by{' '}
			<a
				className="font-medium hover:underline"
				href="https://coinmarketcap.com"
				rel="noopener noreferrer"
				target="_blank"
			>
				CoinMarketCap.com
			</a>
		</p>
	);
}

export default CoinMarketCapAttribution;
