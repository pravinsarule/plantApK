// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require('../middleware/upload');
// const auth = require('../middleware/auth'); // assuming you have auth middleware

// Add product (vendor/company)
// router.post('/',verifyToken, productController.addProduct);
router.post(
  '/',
  verifyToken,
  upload.array('images', 10),  // Up to 10 images
  productController.addProduct
);

// // Update product by id
// router.put('/:id',verifyToken, productController.updateProduct);
router.put(
  '/:id',
  verifyToken,
  upload.array('images', 10),
  productController.updateProduct
);


// Delete product by id
router.delete('/:id', verifyToken,productController.deleteProduct);

// Get products with optional category and subcategory filters
router.get('/', productController.getProducts);

// Get single product by id
// router.get('/:id', productController.getProductById);

module.exports = router;
