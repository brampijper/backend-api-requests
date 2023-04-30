const express = require('express');
const router = express.Router();

const { Octokit } = require("@octokit/rest");
const { isCachedDataValid, storeData } = require('../../utils/isCachedDataValid');
const generateETag = require('../../utils/generateETag');
const takeScreenshot = require('../../utils/screenshot');


// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('repo time: ', Date.now())
    next()
})

router.get('/repos', async (req, res) => {

  // Check if the ETag is present in the request headers
  const etag = req.headers['if-none-match'];

  const { isValid, cachedData } = isCachedDataValid('/repos', etag)

  if (isValid) { 
    // console.log('repos: isvalid: ', isValid)
    res.status(304).end();
    return;
  }

  if (cachedData) {
    // console.log('repos: using cahedData: ')
    res.send(cachedData)
    return;
  } 
  
  else { // Data is not cached, fetch fresh data.
    // console.log('repos: making a normal request')
    const username = req.query.username

    //Create a new Octokit instance
    const octokit = new Octokit({
      auth: process.env.GITHUB_API_KEY,
      userAgent: username,
      Accept: "application/vnd.github.16.28.4.raw",
    });
    
    // Fetch the data using octokit
    const response = octokit.rest.repos.listForUser({username})
  
    response.then( async ({data}) => {
      const promises = data // filter out repos without a homepage and map the properties needed
        
      .filter( repo => repo.homepage) // only repo's with a homepage  
      .map( async ({id, homepage, name, created_at, description, topics}) => { //destructring the properties I need
    
        const image_url = await takeScreenshot(homepage, './files/screenshots'); // Using puppeteer to take screenshot of the website. 
          
        return { 
          id,
          homepage, 
          name, 
          created_at, 
          description, 
          topics,
          image_url
        }
       })

      const repositories = await Promise.all(promises); // Wait for all promises to resolve before continuing
      const etag = generateETag(data) // Generate ETag for the data

      storeData('/repos', repositories, etag) //store the url, repositories, etag to a json file

      res.setHeader('Cache-Control', 'public, max-age=604800')
      res.setHeader('ETag', etag);
      res.send(repositories)
      return;
    })
    .catch(error => res.status(500).send('Failed to fetch data from server ', error))
  }
})

module.exports = router;