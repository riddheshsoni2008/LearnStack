const Certificate = require('../models/Certificate');
const { evaluateAdvancedCertifications } = require('../services/certificateService');

// @desc    Get user's certificates
// @route   GET /api/certificates/me
// @access  Private
const getMyCertificates = async (req, res) => {
  try {
    // Retroactively evaluate and award advanced/professional certificates 
    // for users who already met the criteria before the feature was added.
    await evaluateAdvancedCertifications(req.user._id, req.user);

    const certificates = await Certificate.find({ userId: req.user._id })
      .sort({ issuedAt: -1 })
      .populate('trackId', 'thumbnail');

    res.status(200).json({
      success: true,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a certificate by its unique ID
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certificateId }).select('-userId -trackId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        status: 'NOT_FOUND'
      });
    }

    if (certificate.isRevoked) {
      return res.status(200).json({
        success: true,
        data: certificate,
        status: 'REVOKED'
      });
    }

    return res.status(200).json({
      success: true,
      data: certificate,
      status: 'VALID'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getMyCertificates,
  verifyCertificate
};
