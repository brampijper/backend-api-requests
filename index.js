const express = require('express')
require('dotenv').config()
const github = require('./routes/github');

const app = express() // "check /bin/www.js" for port & settings 

app.get('/', (req,res) => {
  res.json('hi, this is the home of the server')

})

app.use('/api', github)


module.exports = app;