const express = require('express');
const router = express.Router();
let Parser = require('rss-parser');
let parser = new Parser();

router.get('/posts', (req, res) => {
    (async () => {
        let feed = await parser.parseURL('https://focused-galileo-c3ee18.netlify.app/rss.xml');
        
        if (feed.items) {
            const [firstPost] = feed.items;
            res.send(firstPost)
        }
        
        else {
            const message = `An error has occured: ${feed}`;
            console.error(message)
        }
    })();
})

module.exports = router;