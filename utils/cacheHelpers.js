const { readDataFile, writeDataFile } = require('./fileUtils');

let cacheData = readDataFile();

async function isCachedDataValid(url, etag) {
    const data = cacheData[url];

    // No cached data exists, is expired or differnt etags. Fetch fresh data.
    if (!data || !isEtagIdentical(data, etag) || isDataExpired(data)) {
        return false;
    }

    // Data is not expired and Etag is identical. Cached data is valid.
    return true;
}

function getCachedData(url) { // should I not check if the data is expired?
    const data = cacheData[url];
  
    if (!data || isDataExpired(data)) {
        console.log('no cached data on the server, or expired');
        return null;
    }
    
    //all good return the cachedData
    return data;
}

// Check if the given Etag is identical to the data's Etag
function isEtagIdentical(data, etag) {
    return data.etag === etag;
}  

/**
 * Checks if the given data is expired based on the expiration time.
 * @param {object} data - The data to check for expiration.
 * @returns {boolean} - True if the data is expired, false otherwise.
 */
function isDataExpired(data) {
    return Date.now() >= data.expirationTime
}

function storeData(url, data, etag, expirationInSeconds) {
    const expirationInMs = expirationInSeconds * 1000;  // Convert expiration to milliseconds

    const cachedItem = {
        data,
        etag,
        expirationTime: Date.now() + expirationInMs
    }

    cacheData[url] = cachedItem;
    
    writeDataFile(cacheData);
}

module.exports = {
    isCachedDataValid,
    getCachedData,
    storeData
}