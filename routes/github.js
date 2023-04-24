const express = require('express');
const router = express.Router();
const { Octokit } = require("@octokit/rest");
// const cors = require('../utils/cors');
const fetch = require('node-fetch');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

// define github/repos route
router.get('/repos', cors, (req, res) => {
  const username = req.query.username

  const octokit = new Octokit({
    auth: process.env.GITHUB_API_KEY,
    userAgent: username,
    Accept: "application/vnd.github.16.28.4.raw",
  });
  
  const response = octokit.rest.repos.listForUser({username});
  response
    .then( ({data}) => {
      const repositories = data.filter( repo => repo.homepage)
      res.send(repositories)
  }).catch(error => console.error('Error ', error))
})

// define user stats route for github
router.get('/stats', cors, (req, res) => {
  const username = req.query.username
    
  const headers = {
      'Authorization': ` bearer ${process.env.GITHUB_API_KEY}`,
  }

  const body = {
      "query": `query {
          user(login: "${username}") {
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
    
  const response = fetch('https://api.github.com/graphql', { 
    method: 'POST', 
    body: JSON.stringify(body), 
    headers: headers 
  })

  response
    .then( data => data.json())
    .then( ({data}) => {
      const { 
        user: { 
          contributionsCollection: { 
            contributionCalendar: { 
              totalContributions 
            }
          }
        }  
      } = data;
      res.send(totalContributions.toString()) // integer is not valid to send with Express
    })
    .catch( err => console.error('error while fetching ', err))

})

module.exports = router;