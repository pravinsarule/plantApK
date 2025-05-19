const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const User = require('../models/user.model');

/**
 * @route GET /api/users/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;