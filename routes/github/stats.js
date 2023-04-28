const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const { isCachedDataValid, storeData } = require('../../utils/isCachedDataValid');
const generateETag = require('../../utils/generateETag')

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('stats time: ', Date.now())
  next()
})

// define user stats route for github
router.get('/stats', (req, res) => {


  const etag = req.headers['if-none-match'];
  console.log('stats: ', etag)

  const { isValid, cachedData } = isCachedDataValid('/stats', etag)

  if (isValid) {
    // console.log('stats: isvalid: ', isValid)
    res.status(304).end();
    return;
  }

  if (cachedData) {
    // console.log('stats: using cahedData: ')
    res.send(cachedData)
    return;
  } 

  else {
    // console.log('stats: making a normal request')
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
  
        const etag = generateETag(totalContributions)
        
        //store the url, repositories, etag to a json file
        storeData('/stats', totalContributions, etag)
        
        res.setHeader('Cache-Control', 'public, max-age=604800')
        res.setHeader('ETag', etag);
        res.send(totalContributions.toString()) // integer is not valid to send with Express
        return;
      })
      .catch( err => console.error('error while fetching ', err))
  }
})

module.exports = router;