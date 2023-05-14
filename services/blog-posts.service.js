const { storeData } = require('../utils/cacheHelpers')
const generateETag = require('../utils/generateETag')

let Parser = require('rss-parser');
let parser = new Parser();

const fetchBlogPosts = async (path) => {
    const BLOG_URL = 'https://focused-galileo-c3ee18.netlify.app/rss.xml'
    const maxAgeInSeconds = 60;

    try {
        console.log('blog: making a normal request')
        
        let feed = await parser.parseURL(BLOG_URL)
        
        if (!feed.items) {
            const message = `An error has occured: ${feed}`
            console.error(message)
        }
    
        const [firstPost] = feed.items;
    
        const etag = generateETag(firstPost)
        
        storeData(path, firstPost, etag, maxAgeInSeconds)

        return {
            firstPost, 
            etag,
            maxAgeInSeconds: maxAgeInSeconds * 1000 // in ms
        }

    } catch(error) {
        console.error('error while fetching', error);
    }
}

module.exports = {
    fetchBlogPosts
}