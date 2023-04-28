// Generate ETag from the data
module.exports = function(data) {
    const serializedData = JSON.stringify(data);
    const hash = require('crypto').createHash('sha1').update(serializedData).digest('hex');
    return `${hash}`;
}