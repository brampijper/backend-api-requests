const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const { 
    isCachedDataValid, 
    storeData, 
    getCachedData 
} = require('../../utils/isCachedDataValid');

const generateETag = require('../../utils/generateETag')

// middleware that is specific to this router
router.use('/stats', (req, res, next) => {
  console.log('stats time: ', Date.now())
  next()
})

// define user stats route for github
router.get('/stats', (req, res) => {

  const etag = req.headers['if-none-match']; // check for an Etag from the client
  console.log('stats: ', etag)
 
  if (etag) { //etag exists. Let's compare it with the cached server data.
    const isValid = isCachedDataValid('/stats', etag)

    if (isValid) { // Use the cached data on the client side.
      console.log('stats: isvalid: ', isValid)
      res.status(304).end();
      return;
    }
  }

  else { 
    const cachedDataOnServer = getCachedData('/stats'); // check for the cached data on the server with the correct path.
    
    // ok. no cached no data on the client side ? Here. have the cached data from the server.
    if (cachedDataOnServer) {
      console.log( 'cached data on server', cachedDataOnServer);  
      const { cachedData, cachedEtag } = cachedDataOnServer;
      
      res.setHeader('Cache-Control', 'public, max-age=604800')
      res.setHeader('ETag', cachedEtag);
      res.send(cachedData) // integer is not valid to send with Express
      return;
    } 
    
    // No (valid) or cached data, let's fetch new data.

    console.log('stats: making a normal request')
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
  
        const etag = generateETag(totalContributions);
        
        //store the url, repositories, etag to a json file
        storeData('/stats', totalContributions.toString(), etag)
        
        res.setHeader('Cache-Control', 'public, max-age=604800')
        res.setHeader('ETag', etag);
        res.send(totalContributions.toString()) // integer is not valid to send with Express
        return;
      })
      .catch( err => console.error('error while fetching ', err))
  }
})

module.exports = router;