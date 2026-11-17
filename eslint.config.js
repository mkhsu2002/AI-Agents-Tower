import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'spikes/m2/vendor/**'] },
  ...tseslint.configs.recommended,
);
