// src/api.js

// API base URL - change to your production URL when deploying
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // Use same origin in production
  : 'http://localhost:3001'; // Use local server in development

// Main function to fetch all news sources
export async function fetchAllNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}