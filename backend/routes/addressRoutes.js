const express = require('express');
const router = express.Router();
const {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');
const { verifyToken } = require("../middleware/authMiddleware");

// All routes are protected
router.use(verifyToken);

router.get('/', getAllAddresses);
router.get('/:id', getAddressById);
router.post('/',verifyToken, createAddress);
router.put('/:id',verifyToken, updateAddress);
router.delete('/:id', verifyToken,deleteAddress);

module.exports = router;



