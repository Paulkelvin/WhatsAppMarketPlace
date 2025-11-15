/**
 * Utility helper functions
 */

/**
 * Format Nigerian phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export const formatNigerianPhone = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 234
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  }
  
  // If doesn't start with 234, add it
  if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  
  return '+' + cleaned;
};

/**
 * Format currency (Naira)
 * @param {number} amount - Amount in Naira
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  return `₦${amount.toLocaleString('en-NG', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })}`;
};

/**
 * Validate Nigerian phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export const isValidNigerianPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Should be 11 digits starting with 0, or 13 digits starting with 234
  if (cleaned.startsWith('0') && cleaned.length === 11) return true;
  if (cleaned.startsWith('234') && cleaned.length === 13) return true;
  
  return false;
};

/**
 * Parse address from text
 * @param {string} text - Address text
 * @returns {Object} Parsed address
 */
export const parseAddress = (text) => {
  // Simple address parser - can be improved with NLP
  const parts = text.split(',').map(p => p.trim());
  
  const address = {
    street: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    landmark: parts[3] || ''
  };
  
  // Try to identify state
  const nigerianStates = [
    'Lagos', 'Abuja', 'Kano', 'Ogun', 'Oyo', 'Rivers', 'Kaduna', 'Anambra',
    'Delta', 'Edo', 'Enugu', 'Katsina', 'Kwara', 'Imo', 'Benue', 'Sokoto',
    'Bauchi', 'Plateau', 'Osun', 'Ondo', 'Kogi', 'Niger', 'Abia', 'Borno',
    'Cross River', 'Akwa Ibom', 'Bayelsa', 'Ekiti', 'Gombe', 'Jigawa',
    'Kebbi', 'Nasarawa', 'Taraba', 'Yobe', 'Zamfara', 'Ebonyi', 'Adamawa'
  ];
  
  for (const state of nigerianStates) {
    if (text.toLowerCase().includes(state.toLowerCase())) {
      address.state = state;
      break;
    }
  }
  
  return address;
};

/**
 * Generate random ID
 * @param {string} prefix - ID prefix
 * @param {number} length - Length of random part
 * @returns {string} Generated ID
 */
export const generateId = (prefix = 'ID', length = 6) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = prefix + '-';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Get date range for analytics
 * @param {string} period - Period (today, week, month, year)
 * @returns {Object} Start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }
  
  return { start, end: now };
};

/**
 * Sanitize input
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .substring(0, 1000); // Max 1000 characters
};

/**
 * Extract product ID from text
 * @param {string} text - Text containing product ID
 * @returns {string|null} Extracted product ID
 */
export const extractProductId = (text) => {
  const match = text.match(/PRD-\d+/i);
  return match ? match[0].toUpperCase() : null;
};

/**
 * Extract order ID from text
 * @param {string} text - Text containing order ID
 * @returns {string|null} Extracted order ID
 */
export const extractOrderId = (text) => {
  const match = text.match(/ORD-\d+-\d+/i);
  return match ? match[0].toUpperCase() : null;
};

export default {
  formatNigerianPhone,
  formatCurrency,
  isValidNigerianPhone,
  parseAddress,
  generateId,
  delay,
  truncate,
  calculatePercentage,
  getDateRange,
  sanitizeInput,
  extractProductId,
  extractOrderId
};
