// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Clock, Star, AlertTriangle, Shield, Globe, Database, 
         Filter, ExternalLink, Menu, X, Moon, Sun, RefreshCw,
          Laptop, Bug, FileCode, CheckCircle } from 'lucide-react';
import { fetchAllNews } from './api';
import './App.css';

const primaryColor = 'rgb(33, 130, 145)';
const primaryColorLight = 'rgba(33, 130, 145, 0.1)';
const primaryColorMedium = 'rgba(33, 130, 145, 0.3)';

// Main categories for filtering
const categoryIcons = {
  "Vulnerabilities": <AlertTriangle size={18} />,
  "Threats": <Shield size={18} />,
  "Sectors": <Database size={18} />,
  "Regions": <Globe size={18} />,
  "Advisories": <Clock size={18} />,
  "Incidents": <AlertTriangle size={18} className="text-red-500" />,
  "Microsoft": <Laptop size={18} />,
  "Malware": <Bug size={18} />,
  "CVE": <FileCode size={18} />,
  "Patches": <CheckCircle size={18} />
};

function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Extract all available tags from news items
  const allTags = [...new Set(news.flatMap(item => item.tags))].sort();
  
  // All available categories
  const allCategories = Object.keys(categoryIcons);
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Toggle favorite status
  const toggleFavorite = (id) => {
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    localStorage.setItem('inpulse-favorites', JSON.stringify(newFavorites));
  };
  
  // Fetch news data
  const fetchNews = useCallback(async (showRefreshAnimation = true) => {
    if (showRefreshAnimation) {
      setIsRefreshing(true);
    }
    
    try {
      setError(null);
      const newsData = await fetchAllNews();
      setNews(newsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchNews(false);
      } catch (err) {
        console.error("Failed initial data load:", err);
        setError("Failed to load initial data. Please try refreshing the page.");
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchNews(false).catch(err => {
        console.error("Auto-refresh failed:", err);
      });
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []); // Empty dependency array since fetchNews is defined with useCallback
  
  
  // Apply filters
  useEffect(() => {
    let filtered = news;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.summary.toLowerCase().includes(term) ||
        item.source.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.some(cat => item.categories.includes(cat))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }
    
    setFilteredNews(filtered);
  }, [news, searchTerm, selectedCategories, selectedTags]);
  
  // Save selected categories to localStorage
  useEffect(() => {
    localStorage.setItem('inpulse-categories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);
  
  // Save selected tags to localStorage
  useEffect(() => {
    localStorage.setItem('inpulse-tags', JSON.stringify(selectedTags));
  }, [selectedTags]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('inpulse-dark-mode', JSON.stringify(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  // Manual refresh function
  const handleRefresh = () => {
    fetchNews(true);
  };
  
  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearchTerm('');
  };
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Count items per category
  const getCategoryCount = (category) => {
    if (!news || news.length === 0) return 0;
    return news.filter(item => 
      item.categories && 
      Array.isArray(item.categories) && 
      item.categories.includes(category)
    ).length;
  };
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <button className="menu-toggle" onClick={toggleMenu}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="logo">InPulse</h1>
          </div>
          <div className="header-actions">
            <button 
              className="icon-button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <Filter size={20} />
            </button>
            <button 
              className="icon-button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className={`icon-button ${isRefreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh news"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search news..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
          </div>
          
          <div className="categories-container">
            <h2 className="section-heading">Categories</h2>
            <ul className="category-list">
              {allCategories.map(category => (
                <li key={category}>
                  <button
                    className={`category-button ${
                      selectedCategories.includes(category) ? 'selected' : ''
                    }`}
                    data-category={category}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="category-icon">{categoryIcons[category]}</span>
                    <span>{category}</span>
                    <span className="category-count">{getCategoryCount(category)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {(showFilters || menuOpen) && (
            <div className="tags-container">
              <div className="tags-header">
                <h2 className="section-heading">Tags</h2>
                {(selectedCategories.length > 0 || selectedTags.length > 0) && (
                  <button 
                    className="clear-filters-button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="tags-list">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-button ${
                      selectedTags.includes(tag) ? 'selected' : ''
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
        
        {/* Overlay for mobile menu */}
        {menuOpen && (
          <div className="sidebar-overlay" onClick={toggleMenu}></div>
        )}
        
        {/* Main content area */}
        <main className="content">
          <div className="content-header">
            <h2 className="content-title">
              Latest Cybersecurity News 
              {(selectedCategories.length > 0 || selectedTags.length > 0 || searchTerm) && (
                <span className="filter-indicator">
                  (Filtered)
                </span>
              )}
            </h2>
            {lastUpdated && (
              <div className="last-updated">
                Last updated: {formatDate(lastUpdated)}
              </div>
            )}
          </div>
          
          {isLoading && news.length === 0 ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading cybersecurity news...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-button" onClick={handleRefresh}>
                Try Again
              </button>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state">
              No news items match your current filters.
            </div>
          ) : (
            <div className="news-list">
              {filteredNews.map(item => (
                <div key={item.id} className="news-card">
                  <div className="news-card-content">
                    <div className="news-card-header">
                      <span className="news-source">{item.source} • {formatDate(item.pubDate)}</span>
                      <button 
                        className={`favorite-button ${favorites.includes(item.id) ? 'favorited' : ''}`}
                        onClick={() => toggleFavorite(item.id)}
                        aria-label={favorites.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star 
                          size={18} 
                          fill={favorites.includes(item.id) ? "currentColor" : "none"} 
                        />
                      </button>
                    </div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-summary">{item.summary}</p>
                    <div className="news-footer">
                      <div className="news-tags">
                        {item.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="news-tag"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more-link"
                      >
                        Read more <ExternalLink size={14} className="read-more-icon" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;