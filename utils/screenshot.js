const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function takeScreenshot(url, dir, lastPush) {
  const screenshotName = url
    .replace(/^https?:\/\//i, '') // remove "http://" or "https://"
    .replace(/[^a-zA-Z0-9]/g, '-') // replace non-alphanumeric characters with hyphen "-"
    + '.jpg'; // add jpg extension.
    const screenshotPath = path.join(dir, screenshotName);

    //convert lastPushed date to ms.
    const date = new Date(lastPush);
    const lastPushMs = date.getTime();

    const screenshotExists = await checkFileExists(screenshotPath)

    //helper functions
    async function checkFileExists(path) {
      return fs.promises.access(path, fs.constants.F_OK)
        .then( () => true)
        .catch( () => false)
    }

    if (screenshotExists) {
      const screenshotDate = await getBirthTime(screenshotPath)
      
      if (screenshotDate > lastPushMs) {
        console.log(`Screenshot for ${url} is recent, skipping...`);
        return screenshotName
      }
    }

    // helper functions (?)
    async function getBirthTime(path) {
      return fs.promises.stat(path)
        .then( stats => stats.birthtimeMs)
        .catch( err => err )
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions']
    });

    const page = await browser.newPage();
    await page.goto(url);

    await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
      });
      
    await page.screenshot({ 
        path: screenshotPath, 
        // fullPage: true,
        type: 'jpeg',
        quality: 80, 
    });
    
    await browser.close();
  
    console.log(`Screenshot for ${url} created at ${screenshotPath}`);
    return screenshotName;
}

module.exports = takeScreenshot;
