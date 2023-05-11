const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const generateETag = require('../../utils/generateETag');
const { 
    isCachedDataValid, 
    storeData, 
    getCachedData 
} = require('../../utils/cacheUtils');

// middleware that is specific to this router
router.use('/stats', (req, res, next) => {
  // console.log('stats time: ', Date.now())
  next()
})

// define user stats route for github
router.get('/stats', (req, res) => {
  const expirationInMinutes = 1 // set custom expire time for this route.
  const maxAgeInSeconds = expirationInMinutes * 60;

  // Check if the ETag is present in the request headers
  const clientEtag = req.headers['if-none-match']
  console.log('clientEtag in repos: ', clientEtag)

  if (clientEtag) { //etag exists. Let's compare it with the cached server data.
    const isValid = isCachedDataValid('/stats', clientEtag)
    console.log('repos: isvalid: ', isValid);

    if (isValid) { // Use the cached data on the client side.
      console.log('repos: isvalid: ', isValid)      
      res.status(304).end();
      return;
    }
  }

    // check for the cached data on the server with the correct path.
    const cachedDataOnServer = getCachedData('/stats');  

    // ok. no cached no data on the client side ? Here. have the cached data from the server.
    if (cachedDataOnServer) {
      const { data, etag, expirationTime } = cachedDataOnServer; // im actually not checking if this data is not expired lol.
      
      res.setHeader('Cache-Control', `public, max-age=${expirationTime / 1000}`) // expiration time in seconds.
      res.setHeader('ETag', etag)
      res.send(data)
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
        storeData('/stats', totalContributions.toString(), etag, maxAgeInSeconds)
        
        res.setHeader('Cache-Control', `public, max-age=${maxAgeInSeconds}`) // always revalidates with the server
        res.setHeader('ETag', etag)
        res.send(totalContributions.toString()) // integer is not valid to send with Express
        return;
      })
      .catch( err => console.error('error while fetching ', err))
})

module.exports = router;