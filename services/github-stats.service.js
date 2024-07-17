const fetch = require('node-fetch');
const { storeData } = require('../utils/cacheHelpers')
const generateETag = require('../utils/generateETag')

const fetchGithubStats = async (username, path) => {
    const maxAgeInSeconds = 60 * 60 * 12; // cached data expiration = 12 hours

    try {

        const headers = {
            'Authorization': ` bearer ${process.env.GITHUB_API_KEY}`
        }
      
        const body = {
            "query": `query {
                user(login: "${username}") {
                  name
                  contributionsCollection {
                    contributionCalendar {
                      colors
                      totalContributions
                      weeks {
                        contributionDays {
                          color
                          contributionCount
                          date
                          weekday
                        }
                        firstDay
                      }
                    }
                  }
                }
            }`
        }
          
        const response = await fetch('https://api.github.com/graphql', { 
          method: 'POST', 
          body: JSON.stringify(body), 
          headers: headers 
        })

        if (response.status === 401) {
          throw new Error('Unauthorized: Check your API key and permissions')
        }

    
        const { data } = await response.json()
      
        const { 
          user: { 
            contributionsCollection: { 
              contributionCalendar: { 
                totalContributions
              }
            }
          }  
        } = data;
        
        const githubContributions = totalContributions.toString()
        
        const etag = generateETag(totalContributions);
            
        storeData(path, githubContributions, etag, maxAgeInSeconds) //store the url, repositories, etag to a json file
        
        return { 
            data: githubContributions, 
            etag,
            expiration: maxAgeInSeconds * 1000 // in ms
        }

    } catch(error) {
        console.error('error while fetching', error);
    }
}

module.exports = {
    fetchGithubStats
}