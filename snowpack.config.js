module.exports = {
  exclude: ['./node_modules/**'],
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat'
  },
  installOptions: {
    polyfillNode: true
  },
  plugins: [
    [
      '@snowpack/plugin-babel',
      {
        input: ['.js', '.mjs', '.jsx', '.ts', '.tsx'], // (optional) specify files for Babel to transform
        transformOptions: {
          plugins: [
            [
              '@babel/plugin-transform-react-jsx',
              {
                pragma: 'h',
                pragmaFrag: 'Fragment'
              }
            ]
          ]
        }
      }
    ]
  ]
}
