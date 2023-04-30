const express = require('express')
const path = require('path');
require('dotenv').config()

const cors = require('cors');
const { corsOptions } = require('./utils/corsOptions');

// Routes
const repos = require('./routes/github/repos');
const stats = require('./routes/github/stats');
const blog = require('./routes/blog');

// Check "/bin/www.js" for port & settings.
const app = express() 

app.use(express.static(path.join(__dirname, 'files/screenshots'))); // serving static file using  middleware, with the root directory set to ./files.

// Enable cors with the options object.
app.use(cors(corsOptions))

app.get('/', (req,res) => {
  res.json('this is the home of the server')
})

// Enable the routes in the app
app.use('/api', repos)
app.use('/api', stats)
app.use('/blog', blog)

module.exports = app;