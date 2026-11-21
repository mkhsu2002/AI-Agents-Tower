import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['src/domain/homebundle-validator.js', 'dist/**', '.wrangler/**', 'artifacts/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'spikes/m2/vendor/**', 'spikes/m2/schema/validators.js'] },
  ...tseslint.configs.recommended,
);
