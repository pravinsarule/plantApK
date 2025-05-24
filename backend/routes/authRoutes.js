// const express = require('express');
// const router = express.Router();
// const { login, register, verifyOTP, logout } = require('../controller/authController');
// const { verifyToken } = require('../middleware/authMiddleware');

// router.post('/login', login);
// // router.post('/register', register);
// router.post('/verify-otp', verifyOTP);
// router.post('/logout', verifyToken, logout);

// module.exports = router;

const express = require("express");
const router = express.Router();

const { login, verifyOTP, logout } = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/logout", verifyToken, logout);

// Example of role-based route
router.get(
  "/admin-only",
  verifyToken,
  authorizeRoles("company"), // Only role 'company' (admin vendor) can access
  (req, res) => {
    res.json({ message: `Hello Admin Vendor, ${req.vendor.name}` });
  }
);

module.exports = router;
