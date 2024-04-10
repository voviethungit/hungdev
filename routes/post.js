const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');


router.get('/create_post', (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.session.user._id;
      res.render('create_post', { userId });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.post('/post', async (req, res) => {
    try {
      const { title, content } = req.body;
  
     
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // Lấy userId từ session
      const userId = req.session.user._id;
  
      // Tìm người dùng trong cơ sở dữ liệu bằng userId từ session
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Tạo bài viết với userId của người dùng hiện tại
      const newPost = new Post({ title, content, author: userId });
      await newPost.save();
  
      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.get('/user/:userId/posts', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Tìm tất cả các bài viết của người dùng với userId tương ứng
      const userPosts = await Post.find({ author: userId });
  
      // Render trang my_posts.ejs và truyền danh sách các bài viết vào cùng với biến user
      res.render('my_posts', { posts: userPosts, user: req.session.user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  router.get('/update_post/:id', async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);
      
      if (!req.session.user || req.session.user._id.toString() !== post.author.toString()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      res.render('update_post', { post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
router.put('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    // Update post
    await Post.findByIdAndUpdate(postId, { title, content });

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/posts', async (req, res) => {
  try {
    // Fetch all posts
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/post/:id', async (req, res) => {
    try {
      const postId = req.params.id;
  
      // Tìm bài viết bằng ID
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Render trang post_detail.ejs và truyền dữ liệu của bài viết vào
      res.render('post_detail', { post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
router.get('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Fetch post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
