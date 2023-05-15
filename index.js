const express = require('express')
const path = require('path');
require('dotenv').config()

const cors = require('cors');
const { corsOptions } = require('./utils/corsOptions');

// Routes
const router = require('./routes/index');

// Check "/bin/www.js" for port & settings.
const app = express()

// Enable cors with the options object.
app.use(cors(corsOptions))

app.use(router)

app.use(express.static(path.join(__dirname, 'files/screenshots'))); // serving static file using  middleware, with the root directory set to ./files.

// disable the default etag middleware
app.set('etag', false);

module.exports = app;