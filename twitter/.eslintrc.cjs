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
    '@typescript-eslint/no-namespace': 0,
    'react/react-in-jsx-scope': 0,
    // https://stackoverflow.com/questions/38684925/react-eslint-error-missing-in-props-validation
    'react/prop-types': 0,
    'react-hooks/exhaustive-deps': 0,

    'no-unused-vars': 0,
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
    ]
  }
};
