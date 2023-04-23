const express = require('express')
require('dotenv').config()
const github = require('./routes/github');
const blog = require('./routes/blog');

const app = express() // "check /bin/www.js" for port & settings 

app.get('/', (req,res) => {
  res.json('hi, this is the home of the server')

})

app.use('/api', github)
app.use('/blog', blog)

module.exports = app;