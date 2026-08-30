const { uploadBuffer } = require('../config/cloudinary');

/**
 * @desc    Upload an image file (Citizen Evidence or Officer Resolution Proof)
 * @route   POST /api/upload
 * @access  Private
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload',
      });
    }

    // Determine folder based on request query or default
    const folder = req.query.type === 'resolution' ? 'awaz/resolutions' : 'awaz/evidence';

    const result = await uploadBuffer(req.file.buffer, {
      folder,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
    });

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
};

module.exports = {
  uploadImage,
};
