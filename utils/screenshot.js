const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, dir) {
    const screenshotName = `${url.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
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
}


// takeScreenshot('https://www.google.com', './screenshots');

module.exports = takeScreenshot;
