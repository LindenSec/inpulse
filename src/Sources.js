// src/Sources.js
import React from 'react';
import { ArrowLeft, ExternalLink, Globe, Shield, Database, Clock } from 'lucide-react';

// In Sources.js
import { NEWS_SOURCES } from './sourcesConfig';

// Helper function to get icon for category
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Vulnerabilities':
      return <Shield size={18} />;
    case 'Threats':
      return <Shield size={18} />;
    case 'Incidents':
      return <Shield size={18} className="text-red-500" />;
    case 'Advisories':
      return <Clock size={18} />;
    case 'Sectors':
      return <Database size={18} />;
    case 'Regions':
      return <Globe size={18} />;
    default:
      return <Globe size={18} />;
  }
};

function Sources({ onBack }) {
  return (
    <div className="sources-page">
      <div className="sources-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to News</span>
        </button>
        <h1>News Sources</h1>
        <p className="sources-subtitle">
          InPulse aggregates cybersecurity news from the following trusted sources.
        </p>
      </div>

      <div className="sources-grid">
        {NEWS_SOURCES.map((source, index) => (
          <div key={index} className="source-card">
            <div className="source-header">
              <div className="source-icon">{getCategoryIcon(source.category)}</div>
              <div className="source-name">{source.name}</div>
              <div className="source-category">{source.category}</div>
            </div>
            <p className="source-description">{source.description}</p>
            <div className="source-footer">
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="source-link"
              >
                Visit Website <ExternalLink size={14} />
              </a>
              <a 
                href={source.feedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="feed-link"
              >
                RSS Feed <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sources;