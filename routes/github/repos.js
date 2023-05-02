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
  try {
  // const etag = req.headers['if-none-match']; // Check if the ETag is present in the request headers

  // const { isValid, cachedData } = isCachedDataValid('/repos', etag) // Check if cached data is valid using ETag

  // if (isValid) { // If cached data is valid, send 304 status and end response
  //   res.status(304).end();
  //   return;
  // }

  // if (cachedData) { // If there is cached data, send it and end response
  //   res.send(cachedData)
  //   return;
  // } 
   // Data is not cached, fetch fresh data.
    const username = req.query.username

    //Create a new Octokit instance
    const octokit = new Octokit({
      auth: process.env.GITHUB_API_KEY,
      userAgent: username,
      Accept: "application/vnd.github.16.28.4.raw",
    });
    
    // Fetch the data using octokit
    const { data } = await octokit.rest.repos.listForUser({username})

    const repositories = await Promise.all( // Await when all promises are fulfilled (taking screenshots takes a while)
      data
        .filter( (repo) => repo.homepage) // Filter the repo's with a homepage url
        .map( async ({id, homepage, name, created_at, description, topics}) => { //destructring the properties I need
      
          const image_url = await takeScreenshot(homepage, './files/screenshots'); // Using puppeteer to take a screenshot of the website. 
            
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
    );
      
    const newEtag = generateETag(data) // Generate ETag for the data

    // storeData('/repos', repositories, etag) //store the url, repositories, etag to a json file

    res.setHeader('Cache-Control', 'public, max-age=604800')
    res.setHeader('ETag', newEtag);
    res.send(repositories)

  } catch (error) {
    console.error('Failed to fetch data from server', error);
    res.status(500).send('Failed to fetch data from server');
  }
})

module.exports = router;