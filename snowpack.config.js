module.exports = {
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat'
  },
  installOptions: {
    polyfillNode: true
  },
  devOptions: {
    open: 'none'
  },
  plugins: [
    [
      '@snowpack/plugin-babel',
      {
        input: ['.js', '.mjs', '.jsx', '.ts', '.tsx'], // (optional) specify files for Babel to transform
        presets: ['preact'],
        transformOptions: {
          plugins: [
            [
              '@babel/plugin-transform-react-jsx',
              {
                pragma: 'h',
                pragmaFrag: 'Fragment'
              }
            ],
            [
              'babel-plugin-jsx-imports',
              {
                pragma: '{ h } from preact',
                pragmaFrag: '{ Fragment } from preact'
              }
            ]
            //'@prefresh/babel-plugin'
          ]
        }
      }
    ]
    //'@prefresh/snowpack'
  ]
}
