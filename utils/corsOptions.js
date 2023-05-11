const whitelist = process.env.WHITELISTED.split(", ");
// console.log(whitelist)
const corsOptions = {
  exposedHeaders: 'ETag',
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = { corsOptions }