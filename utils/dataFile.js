const fs = require('fs');
const path = require('path');

const CACHE_FILE_PATH = path.join(__dirname, '../files/cache.json');

// Read data from file
function readDataFile() {
  try {
    const data = fs.readFileSync(CACHE_FILE_PATH);
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Write data to file
function writeDataFile(data) {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data));
  } catch (err) {
    console.error('Error writing to cache file:', err);
  }
}

module.exports = {
  readDataFile,
  writeDataFile
};