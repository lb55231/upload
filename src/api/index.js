const files = require.context('./modules/', true, /\.js$/)
let apiMaps = {}
files.keys().forEach(key => {
  apiMaps = Object.assign(apiMaps, files(key).default)
  // modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})
export default apiMaps
