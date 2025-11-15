import { v2 as cloudinary } from 'cloudinary';
import pino from 'pino';

const logger = pino();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with url and public_id
 */
export const uploadImage = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: 'techhub-products',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    logger.info(`Image uploaded successfully: ${result.public_id}`);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file buffers or base64 strings
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    
    logger.info(`${results.length} images uploaded successfully`);
    return results;
  } catch (error) {
    logger.error('Multiple image upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info(`Image deleted successfully: ${publicId}`);
      return { success: true, publicId };
    } else {
      throw new Error('Image deletion failed');
    }
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Delete multiple images
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array>} Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(id => deleteImage(id));
    const results = await Promise.all(deletePromises);
    
    logger.info(`${results.length} images deleted successfully`);
    return results;
  } catch (error) {
    logger.error('Multiple image deletion error:', error);
    throw error;
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 800,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto'
  };

  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (publicId) => {
  return cloudinary.url(publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:low',
    fetch_format: 'auto'
  });
};

/**
 * Upload image from WhatsApp media message
 * @param {Buffer} mediaBuffer - Media buffer from WhatsApp
 * @param {string} fileName - Original filename
 * @returns {Promise<Object>} Upload result
 */
export const uploadWhatsAppMedia = async (mediaBuffer, fileName = 'whatsapp-media') => {
  try {
    // Convert buffer to base64
    const base64String = `data:image/jpeg;base64,${mediaBuffer.toString('base64')}`;
    
    const result = await uploadImage(base64String, {
      public_id: `whatsapp/${Date.now()}-${fileName}`,
      folder: 'techhub-products/whatsapp'
    });

    return result;
  } catch (error) {
    logger.error('WhatsApp media upload error:', error);
    throw error;
  }
};

/**
 * Check if Cloudinary is configured
 * @returns {boolean} Configuration status
 */
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  getThumbnailUrl,
  uploadWhatsAppMedia,
  isCloudinaryConfigured
};
