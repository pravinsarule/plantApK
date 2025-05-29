const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Create a new village
router.post('/', locationController.createVillage);

// Get all villages or villages by city_id
router.get('/', locationController.getVillages);

// Get village by ID
// router.get('/:id', locationController.getVillageById);

// Update a village
router.put('/:id', locationController.updateVillage);

// Enable or disable a village
router.patch('/:id/toggle', locationController.toggleVillageStatus);

// Delete a village
router.delete('/:id', locationController.deleteVillage);

module.exports = router;
