const fs = require('fs');
const path = require('path');

const CACHE_FILE_PATH = path.join(__dirname, '../files/cache/index.json');

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

function generateScreenshotPath(url, dir) {
  const screenshotName = url
    .replace(/^https?:\/\//i, '') // remove "http://" or "https://"
    .replace(/[^a-zA-Z0-9]/g, '-') // replace non-alphanumeric characters with hyphen "-"
    + '.jpg'; // add jpg extension.
    const screenshotPath = path.join(dir, screenshotName);
    return { screenshotPath, screenshotName}
}

// returns a boolean, wether a file exists.
async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } 
  
  catch (error) {
    if(error.code === 'ENOENT') {
      return false // file does not exists
    } 
    else {
      console.log(`Error checking if a file exists: ${error}`)
      return false;
    }
  }
}

// returns birthtime of file in ms.
async function getFileBirthTime(filePath) {
  try {
    const stats = await fs.promises.stat(filePath)
    return stats.birthtime

  } catch (error) {
    console.log(`Error getting file birthtime: ${error}`)
    return null;
  }
}

module.exports = {
  readDataFile,
  writeDataFile,
  checkFileExists,
  getFileBirthTime,
  generateScreenshotPath
};