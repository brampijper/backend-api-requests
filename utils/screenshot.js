const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, dir) {

  const options = new firefox.Options()
  .setBinary('/usr/bin/firefox-esr')
  .headless();

  const driver = await new webdriver.Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(options)
  .build();

  try {
    const screenshotName = url
      .replace(/^https?:\/\//i, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      + '.jpg';
    const screenshotPath = path.join(dir, screenshotName);
    if (fs.existsSync(screenshotPath)) {
      console.log(`Screenshot for ${url} already exists, skipping...`);
      return screenshotName;
    }

    await driver.get(url);
    await driver.manage().window().setRect({ width: 800, height: 1000 });
    await driver.wait(async () => {
      const readyState = await driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000);
    const screenshot = await driver.takeScreenshot();
    const buffer = Buffer.from(screenshot, 'base64');
    await fs.promises.writeFile(screenshotPath, buffer);

    console.log(`Screenshot for ${url} created at ${screenshotPath}`);
    return screenshotName;
  } catch (err) {
    console.log(`Error occurred while taking screenshot of ${url}`, err);
    throw err;
  } finally {
    await driver.quit();
  }
}

// takeScreenshot('https://www.google.com', './screenshots');

module.exports = takeScreenshot;
