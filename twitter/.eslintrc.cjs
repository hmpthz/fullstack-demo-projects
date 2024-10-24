module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  plugins: [
    'unused-imports'
  ],
  rules: {
    'prefer-const': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-unused-vars': 0,
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        'vars': 'all',
        'varsIgnorePattern': '^_',
        'args': 'after-used',
        'argsIgnorePattern': '^_',
      },
    ],
    'react-hooks/exhaustive-deps': 0
  }
};
