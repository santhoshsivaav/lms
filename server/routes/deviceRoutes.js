const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { auth } = require('../middleware/auth');

// Get all devices for the authenticated user
router.get('/', auth, deviceController.getUserDevices);

// Register or update device
router.post('/register', auth, deviceController.checkAndRegisterDevice);

// Remove a device
router.delete('/:deviceId', auth, deviceController.removeDevice);

// Update device activity
router.put('/:deviceId/activity', auth, deviceController.updateDeviceActivity);

module.exports = router; 