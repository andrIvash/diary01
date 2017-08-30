module.exports = {
  plugins: [
    //require('postcss-import')({/* ...options */}),
    // require('postcss-custom-media')({/* ...options */}),
    // require('postcss-css-variables')({/* ...options */}),
    // require('postcss-nested')({/* ...options */}),
    require('autoprefixer')({ browsers: ['last 3 version', '> 1%', 'ie 8', 'ie 9', 'Opera 12.1'] })
  ]
}