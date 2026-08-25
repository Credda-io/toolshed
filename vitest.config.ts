import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // `npm test` runs test/ (the suite this repository ships green).
    // `npm run repro` runs repro/ (the seeded failures, which are red on purpose).
    include: ['**/*.test.ts'],
    environment: 'node',
  },
});
