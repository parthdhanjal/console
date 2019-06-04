module.exports = {
  // Enforce that class methods utilize this
  'class-methods-use-this': 'off',

  // Require or disallow named function expressions
  'func-names': 'off',

  // max line length
  'max-len': ['error', { code: 120, comments: 100, ignoreUrls: true }],

  // Disallow nested ternary expressions
  'no-nested-ternary': 'off',

  // Disallow reassignment of function parameters
  'no-param-reassign': [
    'error',
    {
      props: false,
    },
  ],

  // Disallow the unary operators ++ and --
  'no-plusplus': 'off',

  // Disallow specified syntax
  'no-restricted-syntax': 'off',

  // Disallow assignment in return statement
  'no-return-assign': ['error', 'except-parens'],

  // When there is only a single export from a module, prefer using default export over named export.
  'import/prefer-default-export': 'off',
};