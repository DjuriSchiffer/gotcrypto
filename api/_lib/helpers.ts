import { createRequire } from 'node:module';
import path from 'node:path';

/** Loads an API file the way Vercel does: plain Node `require`. */
export const requireApi = createRequire(path.resolve(import.meta.dirname, '../../api/index.js'));

/** A response object that records what the handler did. */
export const fakeResponse = () => {
	const res = {
		body: undefined as unknown,
		end() {
			res.ended = true;
			return res;
		},
		ended: false,
		headers: {} as Record<string, string>,
		json(body: unknown) {
			res.body = body;
			res.ended = true;
			return res;
		},
		setHeader(name: string, value: string) {
			res.headers[name.toLowerCase()] = value;
			return res;
		},
		status(code: number) {
			res.statusCode = code;
			return res;
		},
		statusCode: 200,
	};
	return res;
};

/** An in-memory stand-in for the bit of Firestore the API uses. */
export const fakeFirestore = (initial: Record<string, unknown> = {}) => {
	const store = new Map(Object.entries(initial));
	const writes: Array<string> = [];

	const db = {
		collection: (collection: string) => ({
			doc: (id: string) => {
				const key = `${collection}/${id}`;
				return {
					get: () => Promise.resolve({ data: () => store.get(key), exists: store.has(key) }),
					set: (value: unknown, options?: { merge?: boolean }) => {
						const current = store.get(key);
						const merge =
							options?.merge === true && typeof current === 'object' && current !== null;
						store.set(key, merge ? { ...current, ...(value as object) } : value);
						writes.push(key);
						return Promise.resolve();
					},
				};
			},
		}),
	};

	return { db, store, writes };
};
