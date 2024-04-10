const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

router.get('/register', (req, res) => {
  res.render('register');
});
  
router.get('/login', (req, res) => {
  res.render('login'); 
});
router.post('/logout', async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Xác thực mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = user; // Lưu thông tin người dùng vào session
    res.redirect('/'); // Chuyển hướng tới trang index

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
