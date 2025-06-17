require('dotenv').config();
const { storeData } = require('../utils/cacheHelpers')
const generateETag = require('../utils/generateETag')
const Parser = require('rss-parser');
const parser = new Parser();

const BLOG_URL = process.env.BLOG_URL
const CACHE_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

/**
 * Fetches the latest blog post from the RSS feed, caches it, and returns metadata.
 * @param {string} cacheKey - Key for storing the cached data.
 * @returns {Promise<{data: object|null, etag: string|null, expiration: number, error?: Error}>}
 */

const fetchBlogPosts = async (path) => {
    try {        
        const rssFeed = await parser.parseURL(BLOG_URL);
        
        if (!rssFeed.items || rssFeed.items.length === 0) {
            throw new Error(`No blog posts found in RSS feed: ${BLOG_URL}`);
        }

        const latestPost = rssFeed.items[0]    
        const etag = generateETag(latestPost)
        
        storeData(path, latestPost, etag, CACHE_MAX_AGE_SECONDS)

        return {
            data: latestPost, 
            etag,
            expiration: CACHE_MAX_AGE_SECONDS * 1000 // in ms
        };
    } catch(error) {
        console.error('error while fetching blog post:', error);
        return { data: null, etag: null, expiration: 0, error }; 
    }
}

module.exports = {
    fetchBlogPosts
}