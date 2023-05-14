const { fetchGithubStats } = require('../services');
const { isClientDataValid, getCachedData } = require('../utils/cacheHelpers');

const handleGetGithubStats = async (req, res, next) => {
    const path = '/stats'
    const username = req.query.username
    const clientEtag = req.headers['if-none-match'] || undefined 

    try {
        const isDataEqual = await isClientDataValid(path, clientEtag)
        
        if (clientEtag && isDataEqual) {
            res.status(304).end() // data did not change.
        }
        
        const getCachedDataOnServer = await getCachedData(path) // Get cached data on server if exists.

        const { data, etag, expiration} = // Use cached data or fetch fresh data,
            getCachedDataOnServer ||  (await fetchGithubStats(username, path))

        res.setHeader('Cache-Control', `public, max-age=${expiration  / 1000}`); // expiration time in seconds.
        res.setHeader('ETag', etag);
        res.send(data);

    } catch(error) {
        console.error('error while fetching', error);
        res.status(500).send('An error occurred while fetching data.');
    }
}

module.exports = {
    handleGetGithubStats
}


/**
 * Controllers:
 * 
 * take the HTTP request forwarded from the route and either return a response, 
 * or keep the chain of calls going. 
 * They handle the HTTP status codes as part of this response too.
 */