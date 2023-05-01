const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, dir) {
    try {
        const screenshotName = url
            .replace(/^https?:\/\//i, '') // remove "http://" or "https://"
            .replace(/[^a-zA-Z0-9]/g, '-') // replace non-alphanumeric characters with hyphen "-"
            + '.jpg'; // add jpg extension.
        const screenshotPath = path.join(dir, screenshotName);
        
        if (fs.existsSync(screenshotPath)) {
            console.log(`Screenshot for ${url} already exists, skipping...`);
            return screenshotName;
        }
      
        const browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();
        await page.goto(url);
    
        await page.setViewport({
            width: 0,
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
    } catch (err) {
        
        console.error(`Error occurred while taking screenshot of ${url}`, err); // Handle any errors that may occur during the function execution
        throw err; // rethrow the error to be handled by the caller of this function
    }
}

// takeScreenshot('https://www.google.com', './screenshots');

module.exports = takeScreenshot