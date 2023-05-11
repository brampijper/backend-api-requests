const express = require('express');
const router = express.Router();
let Parser = require('rss-parser');
let parser = new Parser();

const generateETag = require('../utils/generateETag');
const { 
    isCachedDataValid, 
    storeData, 
    getCachedData 
  } = require('../utils/cacheUtils');

// middleware that is specific to this router
router.use((req, res, next) => {
    // console.log('blog time: ', Date.now())
    next()
})

router.get('/posts', (req, res) => {
    const expirationInMinutes = 1 // set custom expire time for this route.
    const maxAgeInSeconds = expirationInMinutes * 60;
  
    // Check if the ETag is present in the request headers
    const clientEtag = req.headers['if-none-match']
    console.log('clientEtag in posts: ', clientEtag)
  
    if (clientEtag) { //etag exists. Let's compare it with the cached server data.
      const isValid = isCachedDataValid('/posts', clientEtag)
      console.log('posts: isvalid: ', isValid);
  
      if (isValid) { // Use the cached data on the client side.
        console.log('posts: isvalid: ', isValid)      
        res.status(304).end();
        return;
      }
    }

    const cachedDataOnServer = getCachedData('/posts'); // check for the cached data on the server with the correct path.

    // ok. no cached no data on the client side ? Here. have the cached data from the server.
    if (cachedDataOnServer) {
        console.log('posts: cached data on server');  
        const { data, etag, expirationTime } = cachedDataOnServer;
        
        res.setHeader('Cache-Control', `public, max-age=${expirationTime / 1000}`) // expiration time in seconds.
        res.setHeader('ETag', etag)
        res.send(data)
        return;
    } 

    (async () => {
        console.log('blog: making a normal request')
        let feed = await parser.parseURL('https://focused-galileo-c3ee18.netlify.app/rss.xml');
        
        if (!feed.items) {
            const message = `An error has occured: ${feed}`;
            console.error(message)
        }

        const [firstPost] = feed.items;

        const etag = generateETag(firstPost)
        
        storeData('/posts', firstPost, etag, maxAgeInSeconds)

        res.setHeader('Cache-Control', `public, max-age=${maxAgeInSeconds}`) // always revalidates with the server
        res.setHeader('ETag', etag)

        res.send(firstPost)
    })();
})

module.exports = router;