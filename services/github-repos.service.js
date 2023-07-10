const { Octokit } = require("@octokit/rest");
const { storeData } = require('../utils/cacheHelpers');
const generateETag = require('../utils/generateETag');
const takeScreenshot = require('../utils/screenshot');
const sortData = require('../utils/sortData');

const fetchGithubRepos = async (username, path) => {
    const maxAgeInSeconds = 60 * 60 * 24; // cached data expiration = 1 day 

    const octokit = new Octokit({ // Create a new Octokit instance.
        auth: process.env.GITHUB_API_KEY,
        userAgent: username,
        Accept: "application/vnd.github.16.28.4.raw",
    });

    const mapRepoData = async ({id, homepage, name, created_at, description, topics, pushed_at}) => {
        
        const image_url = await takeScreenshot(homepage, './files/screenshots', pushed_at) // Take and save an image on the server.
        
        return { // only return the properties I need.
            id,
            homepage,
            name,
            created_at,
            pushed_at,
            description,
            topics,
            image_url
        }
    }
    
    try {
      const response = await octokit.rest.repos.listForUser({username}) // Fetch the data using octokit
      const { data } = response

      const filterSortAndMapData = data
        .filter( repo => repo.homepage) // Only repo's that have a homepage.
        .sort( (a, b) => sortData(a.pushed_at, b.pushed_at)) // sort by last updated.
        .map(mapRepoData);
      
      const repositories = await Promise.all(filterSortAndMapData) // wait until all the screenshots has been taken.

      const etag = generateETag(data) // Generate ETag for the data

      storeData(path, repositories, etag, maxAgeInSeconds) //store the url, repositories, etag to a json file

      return { 
        data: repositories, 
        etag,
        expiration: maxAgeInSeconds * 1000 // in ms
      }

    }  catch(error) {
        console.error('error while fetching', error);
    }
}

module.exports = {
    fetchGithubRepos
}