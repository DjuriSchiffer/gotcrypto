/**
 * Grants or removes the `admin` custom claim for a user.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.cjs you@example.com
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.cjs you@example.com --remove
 *
 * The user must have signed in with Google at least once. The change takes effect
 * when their ID token refreshes: sign out and in again, or wait up to an hour.
 */
const admin = require('firebase-admin');

admin.initializeApp({ credential: admin.credential.applicationDefault() });

async function main() {
	const email = process.argv[2];
	const remove = process.argv.includes('--remove');

	if (!email || email.startsWith('--')) {
		console.error('Usage: node scripts/set-admin.cjs <email> [--remove]');
		process.exit(1);
	}

	const user = await admin.auth().getUserByEmail(email);
	const { admin: _previous, ...otherClaims } = user.customClaims ?? {};
	const claims = remove ? otherClaims : { ...otherClaims, admin: true };

	await admin.auth().setCustomUserClaims(user.uid, claims);
	console.log(`${remove ? 'Removed admin from' : 'Granted admin to'} ${email} (${user.uid})`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
