const express = require('express')
const router = express.Router()
const { 
    handleGetGithubStats, 
    handleGetGithubRepos, 
    handleGetBlogPosts } = require('../controllers')

router.get('/api/stats', handleGetGithubStats)
router.get('/api/repos', handleGetGithubRepos)
router.get('/blog/posts', handleGetBlogPosts)

module.exports = router;