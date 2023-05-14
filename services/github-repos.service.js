const { Octokit } = require("@octokit/rest");
const { storeData } = require('../utils/cacheHelpers')
const generateETag = require('../utils/generateETag');
const takeScreenshot = require('../utils/screenshot');

const fetchGithubRepos = async (username, path) => {
    const maxAgeInSeconds = 60; 

    const octokit = new Octokit({ //Create a new Octokit instance
        auth: process.env.GITHUB_API_KEY,
        userAgent: username,
        Accept: "application/vnd.github.16.28.4.raw",
    });
    
    try {

      const response = octokit.rest.repos.listForUser({username}) // Fetch the data using octokit
    /*
        Rewrite the part below.
    */
      response
        .then( async ({data}) => {
            const promises = data
                .filter( repo => repo.homepage) // filter out repos without a homepage and map the properties needed  
                .map( async ({id, homepage, name, created_at, description, topics}) => { //destructring the properties I need
      
                    const image_url = await takeScreenshot(homepage, './files/screenshots'); // Using puppeteer to take screenshot of the website. 
            
                    return { 
                        id,
                        homepage, 
                        name, 
                        created_at, 
                        description, 
                        topics,
                        image_url
                    }
                })

            const repositories = await Promise.all(promises); // Wait for all promises to resolve before continuing
  
            const etag = generateETag(data) // Generate ETag for the data
        
            storeData(path, repositories, etag, maxAgeInSeconds) //store the url, repositories, etag to a json file
        
            return { 
                repositories, 
                etag,
                maxAgeInSeconds: maxAgeInSeconds * 1000 // in ms
            }
      })
    }  catch(error) {
        console.error('error while fetching', error);
    }
}

module.exports = {
    fetchGithubRepos
}