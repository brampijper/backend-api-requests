const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()
const { Octokit } = require("@octokit/rest");

const app = express() // "check /bin/www.js" for port & settings 

//cors
const whitelist = ['http://localhost:8080']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.get('/', (req,res) => {
  res.json('hi, this is the home of the server')
})

app.get('/github', cors(corsOptions), (req, res) => {

  const octokit = new Octokit({
    auth: process.env.GITHUB_API_KEY,
    userAgent: "brampijper",
    Accept: "application/vnd.github.16.28.4.raw",
  });

  octokit.rest.repos.listForUser({
    username: "brampijper",
  })
    .then( response => res.json(response.data))
    .catch( error => console.error(error))
})

module.exports = app;