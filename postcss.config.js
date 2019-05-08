module.exports = {
  plugins: [
    require("autoprefixer")(require('postcss-flexbugs-fixes'),{browsers:['last 4 versions']})
  ]
}
