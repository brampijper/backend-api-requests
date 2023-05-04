const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function takeScreenshot(url, dir) {
  const screenshotName = url
    .replace(/^https?:\/\//i, '') // remove "http://" or "https://"
    .replace(/[^a-zA-Z0-9]/g, '-') // replace non-alphanumeric characters with hyphen "-"
    + '.jpg'; // add jpg extension.
    const screenshotPath = path.join(dir, screenshotName);
    
    if (fs.existsSync(screenshotPath)) {
        console.log(`Screenshot for ${url} already exists, skipping...`);
        return screenshotName;
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


// takeScreenshot('https://www.google.com', './screenshots');

module.exports = takeScreenshot;
