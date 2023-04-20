const express = require('express');
const router = express.Router();
const { Octokit } = require("@octokit/rest");
const cors = require('../utils/cors');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

// define github/repos route
router.get('/repos', cors, (req, res) => {
    console.log('repo accessed')
    const octokit = new Octokit({
      auth: process.env.GITHUB_API_KEY,
      userAgent: "brampijper",
      Accept: "application/vnd.github.16.28.4.raw",
    });
  
    octokit.rest.repos.listForUser({
      username: "brampijper",
    })
      .then( response => res.send(response.data))
      .catch( error => console.error(error))
})

// define user stats route for github
router.get('/stats', cors, (req, res) => {
    console.log('stats accessed')
    
    const headers = {
        'Authorization': ` bearer ${process.env.GITHUB_API_KEY}`,
    }
    const body = {
        "query": `query {
            user(login: "brampijper") {
              name
              contributionsCollection {
                contributionCalendar {
                  colors
                  totalContributions
                  weeks {
                    contributionDays {
                      color
                      contributionCount
                      date
                      weekday
                    }
                    firstDay
                  }
                }
              }
            }
        }`
    }
    
    fetch('https://api.github.com/graphql', { 
          method: 'POST', 
          body: JSON.stringify(body), 
          headers: headers 
    })
    .then( data => data.json())
    .then( data => res.send(data))
    .catch( err => console.error('error while fetching ', err))
})

module.exports = router;