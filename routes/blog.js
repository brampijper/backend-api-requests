const express = require('express');
const router = express.Router();
let Parser = require('rss-parser');
let parser = new Parser();

const { isCachedDataValid, storeData } = require('../utils/isCachedDataValid');
const generateETag = require('../utils/generateETag');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('blog time: ', Date.now())
    next()
})

router.get('/posts', (req, res) => {

    // Check if the ETag is present in the request headers
    const etag = req.headers['if-none-match'];
    // console.log(etag)

    const { isValid, cachedData } = isCachedDataValid('/posts', etag)

    if (isValid) {
        // console.log('blog: isvalid: ', isValid)
        res.status(304).end();
        return;
    }

    if (cachedData) {
        // console.log('blog: using cahedData: ')
        res.send(cachedData)
        return;
    } 

    else {
        (async () => {
            // console.log('blog: making a normal request')
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