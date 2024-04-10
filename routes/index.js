const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Default route, render index page
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    const user = req.session.user; 
    res.render('index', { posts, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
