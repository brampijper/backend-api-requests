// cacheHandler.js
const { isCachedDataValid, getCachedData } = require('./cacheHelpers');

async function sendCachedDataToClient (res, path) {
  try {
      const cachedDataOnServer = await getCachedData(path); // Check for the cached data on the server with the correct path.
      if (!cachedDataOnServer) { // If there's cached data on the server, send it to the client.
        return false
      }

      const { data, etag, expirationTime } = cachedDataOnServer;

      res.setHeader('Cache-Control', `public, max-age=${expirationTime / 1000}`); // expiration time in seconds.
      res.setHeader('ETag', etag);
      return data;
      
  } catch (error) {
      console.error('An error occurred while handling cached data:', error);
      res.status(500).send('An error occurred while handling cached data.');
  }
}

async function handleEtagValidation(req, path) {

  try {
    const clientEtag = req.headers['if-none-match']; // Check if the ETag is present in the request headers
    
    if(!clientEtag) {
      console.log('cache handler: no client etag');
      return false
    }

    const isValid = await isCachedDataValid(path, clientEtag); // Etag exists. Let's compare it with the cached server data.
    console.log('cache handler:', isValid);
    return isValid;

  } catch (error) {
    console.error('An error occurred while validating the ETag:', error);
    res.status(500).send('An error occurred while validation the ETag.');
  }
}

module.exports = {
  sendCachedDataToClient,
  handleEtagValidation
}
