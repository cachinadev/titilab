// src/utils/imageUtils.js

/**
 * Get the correct image URL for products.
 * Works with absolute URLs, relative paths, and placeholder fallback.
 * @param {string} imagePath - The image path from the database.
 * @returns {string} - A complete image URL or placeholder path.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.png"; // fallback image

  // If image is already absolute URL
  if (imagePath.startsWith("http")) return imagePath;

  // Ensure path starts with /
  const relativePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  // Get backend base URL from .env
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:4000/api";
  const backendBase = backendUrl.replace(/\/api$/, "");

  return `${backendBase}${relativePath}`;
};

