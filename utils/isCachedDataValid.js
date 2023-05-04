const { readDataFile, writeDataFile } = require('./dataFile');

let cacheData = readDataFile();

function isCachedDataValid(url, etag) {
    const data = cacheData[url];

    if (data) { // data exists
        const isEtagIdentical = etag === data.cachedEtag; // Etag in request headers and the cached Etag on the server match
        const isNotExpired = Date.now() < data.expiration; // Cached data on the server is not expired.

        if (isEtagIdentical && isNotExpired) {
            return true;
        }

        return false // Data is stale or etag did not match, fetch new data. 
    } else {
        return false; // data did not exists on the server. // fetch fresh data.
    }
}

function getCachedData(url) {
    const data = cacheData[url];
    if (!data) {
        console.log('no cached data on the server')
    }
    return data; //return cachedData.

}

function storeData(url, data, etag) {

    cacheData[url] = {
        cachedData: data, 
        cachedEtag: etag,
        expiration: Date.now() + 7 * 24 * 60 * 60 * 1000, //1 week. //set this to 1 minute to test.
    }

    writeDataFile(cacheData);
}

module.exports = {
    isCachedDataValid,
    getCachedData,
    storeData
}