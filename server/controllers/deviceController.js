const Device = require('../models/Device');
const User = require('../models/User');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const MAX_DEVICES = 2;

const deviceController = {
    // Get all devices for a user
    getUserDevices: async (req, res) => {
        try {
            const devices = await Device.find({ user: req.user._id })
                .sort({ lastActive: -1 });
            res.json({ data: devices });
        } catch (error) {
            console.error('Error fetching user devices:', error);
            res.status(500).json({ message: 'Error fetching devices' });
        }
    },

    // Remove a device
    removeDevice: async (req, res) => {
        try {
            const { deviceId } = req.params;
            const device = await Device.findOneAndDelete({
                _id: deviceId,
                user: req.user._id
            });

            if (!device) {
                return res.status(404).json({ message: 'Device not found' });
            }

            res.json({ message: 'Device removed successfully' });
        } catch (error) {
            console.error('Error removing device:', error);
            res.status(500).json({ message: 'Error removing device' });
        }
    },

    // Check device limit and register new device
    checkAndRegisterDevice: async (req, res) => {
        try {
            const { deviceId, deviceName } = req.body;
            const ip = req.ip;
            const userAgent = req.headers['user-agent'];
            const parser = new UAParser(userAgent);
            const browser = parser.getBrowser();
            const os = parser.getOS();
            const deviceType = getDeviceType(userAgent);

            // Get location from IP
            const geo = geoip.lookup(ip);
            const location = geo ? `${geo.city}, ${geo.country}` : 'Unknown';

            // Check if device already exists
            let device = await Device.findOne({
                user: req.user._id,
                deviceId
            });

            if (device) {
                // Update existing device
                device.lastActive = new Date();
                device.ipAddress = ip;
                device.location = location;
                device.loginHistory.push({
                    timestamp: new Date(),
                    ipAddress: ip,
                    location
                });
                await device.save();
                return res.json({ data: device });
            }

            // Check device limit
            const deviceCount = await Device.countDocuments({
                user: req.user._id,
                isActive: true
            });

            if (deviceCount >= MAX_DEVICES) {
                return res.status(403).json({
                    message: 'Device limit reached',
                    limit: MAX_DEVICES,
                    currentDevices: deviceCount
                });
            }

            // Create new device
            device = new Device({
                user: req.user._id,
                deviceId,
                deviceName,
                deviceType,
                browser: `${browser.name} ${browser.version}`,
                os: `${os.name} ${os.version}`,
                ipAddress: ip,
                location,
                loginHistory: [{
                    timestamp: new Date(),
                    ipAddress: ip,
                    location
                }]
            });

            await device.save();
            res.status(201).json({ data: device });
        } catch (error) {
            console.error('Error registering device:', error);
            res.status(500).json({ message: 'Error registering device' });
        }
    },

    // Update device activity
    updateDeviceActivity: async (req, res) => {
        try {
            const { deviceId } = req.params;
            const device = await Device.findOne({
                user: req.user._id,
                deviceId
            });

            if (!device) {
                return res.status(404).json({ message: 'Device not found' });
            }

            device.lastActive = new Date();
            await device.save();

            res.json({ message: 'Device activity updated' });
        } catch (error) {
            console.error('Error updating device activity:', error);
            res.status(500).json({ message: 'Error updating device activity' });
        }
    }
};

// Helper function to determine device type
function getDeviceType(userAgent) {
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();

    if (device.type === 'mobile') return 'mobile';
    if (device.type === 'tablet') return 'tablet';
    if (device.type === 'desktop') return 'desktop';
    return 'other';
}

module.exports = deviceController; 