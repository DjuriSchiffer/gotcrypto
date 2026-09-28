import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Remove rendered components after every test, so tests don't see each other's output.
// Testing Library only does this automatically when Vitest's `globals` option is on.
afterEach(() => {
	cleanup();
});
