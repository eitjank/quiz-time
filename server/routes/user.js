const router = require('express').Router();
const User = require('../db/models/User');
const authenticateUser = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

router.get('/currentUser', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.user.id).select('email username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/updateUsername', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.username = req.body.username;
    await user.save();
    res.json({
      message: 'Username updated successfully',
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/changePassword', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const validPassword = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/deleteAccount', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
