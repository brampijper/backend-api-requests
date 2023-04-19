const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/world', (req, res) => res.send("Hi World"))

module.exports = app;