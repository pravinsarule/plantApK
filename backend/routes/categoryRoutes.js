const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoryController');

router.get('/categories', categoriesController.getAllCategories);

module.exports = router;
