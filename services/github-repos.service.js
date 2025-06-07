const { storeData } = require('../utils/cacheHelpers');
const generateETag = require('../utils/generateETag');
const takeScreenshot = require('../utils/screenshot');
const sortData = require('../utils/sortData');

const fetchGithubRepos = async (username, path) => {
  try {
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({
      auth: process.env.GITHUB_API_KEY,
      userAgent: username,
      Accept: "application/vnd.github.16.28.4.raw",
    });

    // 1. Add response validation
    const response = await octokit.rest.repos.listForUser({ username });
    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error('Invalid GitHub API response structure');
    }

    // 2. Safe data processing with error handling
    const processRepo = async (repo) => {
      try {
        return {
          id: repo.id,
          homepage: repo.homepage,
          name: repo.name,
          created_at: repo.created_at,
          pushed_at: repo.pushed_at,
          description: repo.description,
          topics: repo.topics,
          image_name: await takeScreenshot(repo.homepage, '/app/files/screenshots', repo.pushed_at)
        };
      } catch (screenshotError) {
        console.error(`Screenshot failed for ${repo.name}:`, screenshotError);
        return { ...repo, image_name: null };
      }
    };

    // 3. Parallel processing with safety
    const reposWithHomepages = response.data.filter(repo => repo.homepage);
    const sortedRepos = reposWithHomepages.sort((a, b) => sortData(a.pushed_at, b.pushed_at));
    const repositories = await Promise.all(sortedRepos.map(processRepo));

    // 4. Validate before storing
    const etag = generateETag(repositories);
    storeData(path, repositories, etag, 60 * 60 * 24);

    return {
      data: repositories,
      etag,
      expiration: 86400000 // 24h in ms
    };

  } catch (error) {
    console.error('Critical error:', error);
    // 5. Return structured error for frontend
    return {
      error: error.message,
      data: [],
      etag: null,
      expiration: 0
    };
  }
};

module.exports = { fetchGithubRepos };
