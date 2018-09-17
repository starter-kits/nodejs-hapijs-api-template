module.exports = {
  root: true,
  extends: "eslint:recommended",
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  env: {
    es6: true,
    node: true,
    commonjs: true,
    jest: true
  },
  rules: {
    'comma-dangle': ['error', 'only-multiline']
  }
};
