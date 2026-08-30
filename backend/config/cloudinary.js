const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'btlopiv9';
const apiKey = process.env.CLOUDINARY_API_KEY || '333169968982578';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured = () => {
  return (
    cloudName &&
    apiKey &&
    apiSecret &&
    apiSecret !== 'your_cloudinary_api_secret_here' &&
    apiSecret !== '<your_api_secret>'
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log('[Cloudinary] Configured successfully for cloud:', cloudName);
} else {
  console.log('[Cloudinary Info] Credentials not fully set in .env. Running in hybrid/mock fallback mode.');
}

/**
 * Uploads a file buffer to Cloudinary with fallback to Base64 data URI
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBuffer = async (buffer, options = {}) => {
  const folder = options.folder || 'awaz/evidence';

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { max_width: 1920, max_height: 1080, crop: 'limit' },
          ],
          ...options,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url || result.url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Graceful Local Fallback for Demo & Tests when API Secret is pending
  const mimeType = options.mimetype || 'image/jpeg';
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;
  const mockPublicId = `awaz_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  return {
    url: dataUri,
    publicId: mockPublicId,
    width: 800,
    height: 600,
    format: mimeType.split('/')[1] || 'jpeg',
  };
};

module.exports = {
  cloudinary,
  uploadBuffer,
  isCloudinaryConfigured,
};
