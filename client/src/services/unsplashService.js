// Unsplash API Configuration
const UNSPLASH_ACCESS_KEY = 'bZNTteIEbEifaJnlqcvhluvKJWsjZ9CmsIQyMlyJE-g';
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

/**
 * Fetch random images from Unsplash based on query
 * @param {string} query - Search query (e.g., 'banking', 'fintech', 'modern')
 * @param {number} count - Number of images to fetch (default: 1)
 * @returns {Promise<Array>} Array of image objects
 */
export const fetchUnsplashImages = async (query, count = 1) => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_BASE}/search/photos?query=${query}&count=${count}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
};

/**
 * Get a random background image for login page
 * @returns {Promise<string>} Image URL
 */
export const getLoginBackground = async () => {
  const images = await fetchUnsplashImages('banking fintech modern', 1);
  
  if (images.length > 0) {
    return images[0].urls.regular;
  }
  
  // Fallback to a solid gradient if no image found
  return null;
};

/**
 * Get random user avatar
 * @param {string} name - User name for consistent avatar
 * @returns {Promise<string>} Avatar URL
 */
export const getUserAvatar = async (name) => {
  try {
    // Use Unsplash's built-in random user photos
    const seed = btoa(name).substring(0, 10);
    const response = await fetch(
      `${UNSPLASH_API_BASE}/users/${seed}/photos?client_id=${UNSPLASH_ACCESS_KEY}&limit=1`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0].urls.thumb;
      }
    }
  } catch (error) {
    console.error('Error fetching user avatar:', error);
  }
  
  // Fallback: Use DiceBear avatars API (no key needed)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
};

/**
 * Get dashboard background images (subtle)
 * @returns {Promise<string>} Image URL
 */
export const getDashboardBackground = async () => {
  const images = await fetchUnsplashImages('abstract geometric minimal', 1);
  
  if (images.length > 0) {
    return images[0].urls.regular;
  }
  
  return null;
};

/**
 * Cache images locally to reduce API calls
 */
const imageCache = {};

export const getCachedImage = (key) => {
  return imageCache[key] || null;
};

export const setCachedImage = (key, imageUrl) => {
  imageCache[key] = imageUrl;
};

export const clearImageCache = () => {
  Object.keys(imageCache).forEach(key => delete imageCache[key]);
};
