const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../db/models/User');
const { createSecretToken } = require('../utils/secretToken');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: 'Email already exists' });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.json({ message: 'Username already exists' });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie('token', token, {
      withCredentials: true,
      httpOnly: true,
    });
    res
      .status(201)
      .json({ message: 'User signed in successfully', success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Incorrect password or email' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: 'Incorrect password or email' });
    }
    const token = createSecretToken(user._id);
    res.cookie('token', token, {
      withCredentials: true,
      httpOnly: true,
    });
    res
      .status(201)
      .json({ message: 'User logged in successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.status(200).json({ message: 'Logged out' });
});

// userVerification
router.post('/', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false });
    } else {
      const user = await User.findById(data.id);
      if (user) return res.json({ status: true, user: user.username });
      else return res.json({ status: false });
    }
  });
});

module.exports = router;
