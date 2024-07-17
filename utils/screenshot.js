const puppeteer = require('puppeteer');
const { checkFileExists, getFileBirthTime, generateScreenshotPath} = require('./fileUtils');

/**
 * Takes a screenshot of the given URL.
 * @param {string} url - The URL to capture a screenshot of.
 * @param {string} dir - The directory to save the screenshot.
 * @param {string} lastPush - The timestamp representing the last push.
 * @returns {string} - The filename of the screenshot.
 */
async function takeScreenshot(url, dir, lastPush) {
    const {screenshotPath, screenshotName} = generateScreenshotPath(url, dir);

    // Convert lastPushed date to milliseconds.
    const lastPushMs = new Date(lastPush).getTime();

    const screenshotExists = await checkFileExists(screenshotPath)
    const fileBirthTimeMs = screenshotExists ? await getFileBirthTime(screenshotPath) : null

    if (screenshotExists && fileBirthTimeMs > lastPushMs) {
      console.log(`Screenshot for ${url} is recent, skipping...`);
      return screenshotName
    }

    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
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
