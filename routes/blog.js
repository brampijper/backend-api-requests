const express = require('express');
const router = express.Router();
let Parser = require('rss-parser');
let parser = new Parser();

const generateETag = require('../utils/generateETag');
const { 
    isCachedDataValid, 
    storeData, 
    getCachedData 
  } = require('../utils/isCachedDataValid');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('blog time: ', Date.now())
    next()
})

router.get('/posts', (req, res) => {

    // Check if the ETag is present in the request headers
    const etag = req.headers['if-none-match'];
    // console.log(etag)

    if (etag) { //etag exists. Let's compare it with the cached server data.
        const isValid = isCachedDataValid('/posts', etag)
    
        if (isValid) { // Use the cached data on the client side.
          console.log('posts: isvalid: ', isValid)
          res.status(304).end();
          return;
        }
      }

    else {
        const cachedDataOnServer = getCachedData('/posts'); // check for the cached data on the server with the correct path.
    
        // ok. no cached no data on the client side ? Here. have the cached data from the server.
        if (cachedDataOnServer) {
          console.log( 'cached data on server', cachedDataOnServer);  
          const { cachedData, cachedEtag } = cachedDataOnServer;
          
          res.setHeader('Cache-Control', 'public, max-age=604800')
          res.setHeader('ETag', cachedEtag);
          res.send(cachedData)
          return;
        } 

        (async () => {
            console.log('blog: making a normal request')
            let feed = await parser.parseURL('https://focused-galileo-c3ee18.netlify.app/rss.xml');
            
            if (feed.items) {
                const [firstPost] = feed.items;
    
                const etag = generateETag(firstPost)
                
                storeData('/posts', firstPost, etag)

                res.setHeader('Cache-Control', 'public, max-age=604800')
                res.setHeader('ETag', etag);
    
                res.send(firstPost)
            }
            
            else {
                const message = `An error has occured: ${feed}`;
                console.error(message)
            }
        })();
    }

})

module.exports = router;