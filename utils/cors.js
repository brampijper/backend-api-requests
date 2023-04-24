const cors = require('cors')

const whitelist = process.env.WHITELISTED.split(", ");
console.log(whitelist)
const corsOptions = {
  origin: function (origin, callback) {
    console.log(whitelist)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = cors(corsOptions);