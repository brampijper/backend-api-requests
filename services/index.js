const { fetchGithubStats } = require('./github-stats.service')
const { fetchGithubRepos } = require('./github-repos.service')
const { fetchBlogPosts } = require('./blog-posts.service')

module.exports = {
    fetchGithubStats,
    fetchGithubRepos,
    fetchBlogPosts
}