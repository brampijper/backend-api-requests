const express = require('express')
require('dotenv').config()

// Routes
const repos = require('./routes/github/repos');
const stats = require('./routes/github/stats');
const blog = require('./routes/blog');

// Check "/bin/www.js" for port & settings.
const app = express() 

app.use((req, res, next) => {
  
  // setting corrs to the most flexible settings, while developing.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Expose-Headers', '*')

  next()
})

app.get('/', (req,res) => {
  res.json('hi, this is the home of the server')
})


app.use('/api', repos)
app.use('/api', stats)
app.use('/blog', blog)

module.exports = app;