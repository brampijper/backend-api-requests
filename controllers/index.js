const { handleGetGithubStats } = require('./github-stats.controller')
const { handleGetGithubRepos } = require('./github-repos.controller')
const { handleGetBlogPosts } = require('./blog-posts.controller')

module.exports = {
    handleGetGithubStats,
    handleGetGithubRepos,
    handleGetBlogPosts
}