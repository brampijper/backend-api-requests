const express = require('express');
const router = express.Router();

const { Octokit } = require("@octokit/rest");
const generateETag = require('../../utils/generateETag');
const takeScreenshot = require('../../utils/screenshot');
const { 
  isCachedDataValid, 
  storeData, 
  getCachedData 
} = require('../../utils/cacheUtils');

// middleware that is specific to this router
router.use('/repos', (req, res, next) => {
    // console.log('repo time: ', Date.now())
    next()
})

router.get('/repos', async (req, res) => {
  const expirationInMinutes = 1 // set custom expire time for this route.
  const maxAgeInSeconds = expirationInMinutes * 60;

  // Check if the ETag is present in the request headers
  const clientEtag = req.headers['if-none-match']
  console.log('clientEtag in repos: ', clientEtag)

  if (clientEtag) { //etag exists. Let's compare it with the cached server data.
    const isValid = isCachedDataValid('/repos', clientEtag)
    console.log('repos: isvalid: ', isValid);

    if (isValid) { // Use the cached data on the client side.
      console.log('repos: isvalid: ', isValid)      
      res.status(304).end();
      return;
    }
  }

  // check for the cached data on the server with the correct path.
  const cachedDataOnServer = getCachedData('/repos');
    
  // ok. no cached no data on the client side ? Here. have the cached data from the server.
  if (cachedDataOnServer) {
    console.log('repos: cached data on server');  
    const { data, etag, expirationTime } = cachedDataOnServer; // im actually not checking if this data is not expired lol.

    const promises = data
      .map( async (repo) => {
        const screenshotName = await takeScreenshot(repo.homepage, './files/screenshots'); // Check if images exist -> are there? all good. // could write a more efficient funcion for this.

        if (screenshotName !== repo.image_url) { // if not replace with updated image_url.
          console.log(screenshotName); 
          repo.image_url = screenshotName;
        } 
        return repo;
      })

    const repositories = await Promise.all(promises); // Wait for all promises to resolve before continuing

    res.setHeader('Cache-Control', `public, max-age=${expirationTime / 1000}`) // expiration time in seconds.
    res.setHeader('ETag', etag)
    res.send(repositories)
    return;
  } 

    console.log('repos: making fresh response')
    const username = req.query.username || "brampijper"

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
      
      storeData('/repos', repositories, etag, maxAgeInSeconds) //store the url, repositories, etag to a json file
      
      res.setHeader('Cache-Control', `public, max-age=${maxAgeInSeconds}`) // always revalidates with the server
      res.setHeader('ETag', etag)
      res.send(repositories)
      return;
    })
})

module.exports = router;