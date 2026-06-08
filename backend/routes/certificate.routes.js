const express = require('express');
const router = express.Router();
const { getMyCertificates, verifyCertificate } = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/me', protect, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
