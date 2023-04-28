const { readDataFile, writeDataFile } = require('./dataFile');

let cacheData = readDataFile();

// If the ETag is present in both the request headers and the cache,
// and they match, return a 304 Not Modified response
function isCachedDataValid(url, etag) {
    const data = cacheData[url];

    if (data && etag === data.cachedEtag && Date.now() < data.expiration) {
        return { isValid: true, cachedData: data}
    } else {
        return { isValid: false, cacheData: null}
    }
}

function storeData(url, data, etag) {

    cacheData[url] = {
        cachedData: data, 
        cachedEtag: etag,
        expiration: Date.now() + 7 * 24 * 60 * 60 * 1000, //1 week. 
    }

    writeDataFile(cacheData);
}

module.exports = {
    isCachedDataValid,
    storeData
}