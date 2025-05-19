const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Import the NEWS_SOURCES array - using CommonJS require
// Make sure your sourcesConfig.js is in CommonJS format (module.exports = ...)
let NEWS_SOURCES = [];
try {
  const sourcesConfig = require('./src/sourcesConfig');
  NEWS_SOURCES = sourcesConfig.NEWS_SOURCES || [];
  console.log(`Loaded ${NEWS_SOURCES.length} news sources from config`);
} catch (error) {
  console.error('Error loading news sources:', error.message);
  NEWS_SOURCES = [];
}

// Define a list of category keywords to categorize news
const CATEGORY_KEYWORDS = {
  'Vulnerabilities': ['vulnerability', 'exploit', 'security flaw', 'bug', 'security issue'],
  'Threats': ['threat', 'attack vector', 'cyber attack', 'cyber threat'],
  'Incidents': ['breach', 'attack', 'hacked', 'leak', 'data theft', 'incident', 'compromise', 'stolen'],
  'Advisories': ['advisory', 'alert', 'warning', 'bulletin', 'guidance', 'notification', 'cert'],
  'Sectors': ['healthcare', 'financial', 'banking', 'government', 'utilities', 'critical infrastructure', 'manufacturing', 'retail', 'education'],
  'Regions': ['us', 'uk', 'europe', 'asia', 'russia', 'china', 'north korea', 'iran'],
  'Microsoft': ['microsoft', 'windows', 'office', 'azure', 'exchange', 'outlook', 'sharepoint', 'teams', 'active directory', 'msft'],
  'Malware': ['malware', 'ransomware', 'trojan', 'virus', 'worm', 'spyware', 'adware', 'rootkit', 'backdoor', 'cryptojacking', 'botnet'],
  'CVE': ['cve', 'common vulnerabilities and exposures', 'cve-20'],
  'Patches': ['patch', 'update', 'security update', 'hotfix', 'fix', 'bugfix', 'upgrade', 'mitigation']
};

// Define industry-specific tags
const COMMON_TAGS = [
  // Threat types
  'Ransomware', 'Phishing', 'Data Breach', 'Zero-day', 'Supply Chain', 'DDoS', 'Botnet',
  'Cryptojacking', 'Spyware', 'Trojan', 'Worm', 'Rootkit', 'Backdoor', 'Virus', 'APT',
  
  // Vulnerability types
  'CVE', 'Remote Code Execution', 'Privilege Escalation', 'SQL Injection', 'XSS',
  'Authentication Bypass', 'Memory Corruption', 'Buffer Overflow', 'CSRF',
  
  // Remediation
  'Patch', 'Update', 'Hotfix', 'Mitigation', 'Workaround',
  
  // Vendors
  'Microsoft', 'Google', 'Apple', 'Linux', 'Cisco', 'Adobe', 'Oracle', 'VMware',
  'AWS', 'Azure', 'SAP', 'Fortinet', 'Palo Alto', 'Juniper', 'IBM', 'Salesforce',
  
  // Products
  'Windows', 'Office', 'Exchange', 'SharePoint', 'Teams', 'Chrome', 'Firefox',
  'Android', 'iOS', 'macOS', 'Ubuntu', 'Active Directory', 'Outlook',
  
  // Sectors
  'Healthcare', 'Financial', 'Government', 'Retail', 'Manufacturing', 'Energy',
  'Utilities', 'Defense', 'Education', 'Banking', 'Insurance', 'Critical Infrastructure',
  
  // Security areas
  'Cloud Security', 'Network Security', 'Identity', 'Authentication', 'IoT',
  'OT Security', 'SCADA', 'Mobile Security', 'Endpoint Security',
  
  // Compliance
  'Compliance', 'GDPR', 'PCI', 'HIPAA', 'SOC', 'ISO27001', 'NIST'
];

// Demo data that will be returned if real feeds fail
const demoData = [
  {
    id: uuidv4(),
    source: 'InPulse Demo',
    title: 'Welcome to InPulse Cybersecurity News Aggregator',
    summary: 'This is demo data shown because no live feeds could be fetched at the moment. In a production environment, this would be replaced with real cybersecurity news from various sources.',
    url: 'https://github.com/yourusername/inpulse',
    pubDate: new Date().toISOString(),
    categories: ['Advisories'],
    tags: ['Demo', 'InPulse']
  },
  {
    id: uuidv4(),
    source: 'Cybersecurity Demo',
    title: 'Sample Microsoft Vulnerability Advisory',
    summary: 'This is a sample vulnerability announcement to demonstrate how the InPulse aggregator categorizes and displays security information for Microsoft products.',
    url: 'https://github.com/yourusername/inpulse',
    pubDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    categories: ['Vulnerabilities', 'Microsoft', 'Advisories'],
    tags: ['CVE', 'Windows', 'Patch', 'Microsoft']
  },
  {
    id: uuidv4(),
    source: 'Security Alert Demo',
    title: 'Sample Ransomware Threat Alert',
    summary: 'This is a sample ransomware threat alert to demonstrate how the InPulse aggregator categorizes and displays malware threat information.',
    url: 'https://github.com/yourusername/inpulse',
    pubDate: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    categories: ['Threats', 'Malware'],
    tags: ['Ransomware', 'Phishing', 'Email']
  },
  {
    id: uuidv4(),
    source: 'CVE Database Demo',
    title: 'Sample CVE-2023-1234 Disclosure',
    summary: 'This is a sample CVE disclosure to demonstrate how the InPulse aggregator handles and categorizes CVE entries and specific vulnerability information.',
    url: 'https://github.com/yourusername/inpulse',
    pubDate: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    categories: ['Vulnerabilities', 'CVE'],
    tags: ['CVE-2023-1234', 'Buffer Overflow', 'Remote Code Execution']
  },
  {
    id: uuidv4(),
    source: 'Patch Tuesday Demo',
    title: 'Sample Security Update Release',
    summary: 'This is a sample security update announcement to demonstrate how the InPulse aggregator categorizes and displays patch information.',
    url: 'https://github.com/yourusername/inpulse',
    pubDate: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    categories: ['Patches', 'Microsoft', 'Advisories'],
    tags: ['Update', 'Patch Tuesday', 'Windows', 'Microsoft']
  }
];

// Helper function to ensure value is a string
function ensureString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Handle specific object types that might contain text
    if (value["#text"]) return String(value["#text"]);
    if (value["@_text"]) return String(value["@_text"]);
    if (value.value) return String(value.value);
    try {
      return String(value);
    } catch (e) {
      return '';
    }
  }
  return String(value);
}

// Function to clean HTML from text
function cleanHtml(html) {
  if (!html) return '';
  
  // Check if html is an object and not a string (common in Atom feeds)
  if (typeof html !== 'string') {
    // If it's an object with a specific structure like content."#text" or content.value
    if (html._text) return cleanHtml(html._text);
    if (html.__text) return cleanHtml(html.__text);
    if (html["#text"]) return cleanHtml(html["#text"]);
    if (html.value) return cleanHtml(html.value);
    
    // If we can't find text content, try to convert object to string
    try {
      return cleanHtml(JSON.stringify(html));
    } catch (e) {
      console.log("Could not parse HTML content:", typeof html);
      return '';
    }
  }
  
  // Remove HTML tags using regex
  let text = html.replace(/<[^>]*>?/gm, '');
  
  // Decode HTML entities
  text = text.replace(/&quot;/g, '"')
             .replace(/&apos;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>');
  
  // Trim and limit length
  text = text.trim().substring(0, 300);
  
  // Add ellipsis if truncated
  if (text.length === 300) {
    text += '...';
  }
  
  return text;
}

// Function to extract categories and tags based on content
function categorizeNewsItem(item, defaultCategory) {
  const categories = new Set();
  const tags = new Set();
  
  // Add default category
  const categoryToUse = ensureString(defaultCategory || 'Uncategorized');
  categories.add(categoryToUse);
  
  // Combine title and summary for analysis
  const content = `${ensureString(item.title || '')} ${ensureString(item.summary || '')}`.toLowerCase();
  
  // Check for category keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Simple contains check
      if (content.includes(keyword.toLowerCase())) {
        categories.add(category);
        break;
      }
    }
  }
  
  // Extract potential tags - simplified matching
  for (const tag of COMMON_TAGS) {
    const tagLower = tag.toLowerCase();
    if (content.includes(tagLower)) {
      tags.add(tag);
    }
  }
  
  // Special handling for CVEs
  const cveRegex = /CVE-\d{4}-\d{4,}/gi;
  const cveMatches = content.match(cveRegex);
  if (cveMatches) {
    categories.add('CVE');
    // Add up to 3 specific CVEs as tags
    cveMatches.slice(0, 3).forEach(cve => tags.add(ensureString(cve.toUpperCase())));
  }
  
  // Add default tags if none found
  if (tags.size === 0) {
    // Add the category as a tag
    Array.from(categories).forEach(category => tags.add(ensureString(category)));
    
    // If still no tags, add a generic source tag
    if (tags.size === 0 && item.source) {
      tags.add(ensureString(item.source));
    }
    
    // Final fallback
    if (tags.size === 0) {
      tags.add('Cybersecurity');
    }
  }
  
  // Ensure all categories and tags are strings
  const stringCategories = Array.from(categories).map(cat => ensureString(cat));
  const stringTags = Array.from(tags).map(tag => ensureString(tag));
  
  return {
    categories: stringCategories,
    tags: stringTags
  };
}

// Parse RSS feed and extract items - improved version
function parseRss(xmlContent, sourceName, defaultCategory) {
  try {
    // Early check for non-XML content
    if (typeof xmlContent !== 'string' || 
        (!xmlContent.includes('<rss') && !xmlContent.includes('<feed') && !xmlContent.includes('<?xml'))) {
      console.log(`Content from ${sourceName} does not appear to be valid XML/RSS/Atom`);
      return [];
    }
    
    // Create parser with options
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      // additional options for better parsing
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false
    });
    
    // Parse the XML
    const result = parser.parse(xmlContent);
    
    // Debug the structure
    console.log(`Data from ${sourceName} parsed. Top-level keys:`, Object.keys(result));
    
    // Handle case when result is HTML instead of proper RSS/XML
    if (result.html || (Object.keys(result).length === 1 && result.html)) {
      console.log(`Feed from ${sourceName} appears to be HTML instead of RSS/Atom, skipping.`);
      return [];
    }
    
    // Handle different RSS formats
    let items = [];
    
    if (result.rss && result.rss.channel) {
      // Standard RSS format
      const channel = result.rss.channel;
      let rssItems = channel.item;
      
      // Ensure items is an array
      if (!rssItems) {
        console.log(`No items found in feed from ${sourceName}`);
        return [];
      }
      
      if (!Array.isArray(rssItems)) {
        rssItems = [rssItems];
      }
      
      console.log(`Found ${rssItems.length} items in RSS feed from ${sourceName}`);
      
      // Map RSS items to our format
      items = rssItems.map(item => {
        const title = ensureString(item.title || 'No Title');
        const link = ensureString(item.link || '');
        const description = item.description || '';
        const pubDate = ensureString(item.pubDate || new Date().toISOString());
        
        // Clean description
        const summary = cleanHtml(description);
        
        return { title, url: link, summary, pubDate };
      });
    } else if (result.feed) {
      // Atom feed format
      let entries = result.feed.entry;
      
      // Ensure entries is an array
      if (!entries) {
        console.log(`No entries found in Atom feed from ${sourceName}`);
        return [];
      }
      
      if (!Array.isArray(entries)) {
        entries = [entries];
      }
      
      console.log(`Found ${entries.length} entries in Atom feed from ${sourceName}`);
      
      // Map Atom entries to our format
      items = entries.map(entry => {
        const title = ensureString(entry.title || 'No Title');
        let link = '';
        
        if (entry.link) {
          // Handle different link formats
          if (typeof entry.link === 'string') {
            link = entry.link;
          } else if (Array.isArray(entry.link)) {
            // Find the first link with rel="alternate" or just take the first one
            const alternateLink = entry.link.find(l => l['@_rel'] === 'alternate');
            link = alternateLink ? ensureString(alternateLink['@_href']) : ensureString(entry.link[0]['@_href'] || '');
          } else {
            link = ensureString(entry.link['@_href'] || '');
          }
        }
        
        // Handle content which might be in various places
        let content = '';
        if (entry.content) {
          content = entry.content;
        } else if (entry.summary) {
          content = entry.summary;
        }
        
        const pubDate = ensureString(entry.published || entry.updated || new Date().toISOString());
        
        // Clean content
        const summary = cleanHtml(content);
        
        return { title, url: link, summary, pubDate };
      });
    } else {
      // Unknown format, try to find items
      console.log(`Unknown RSS format from ${sourceName}. Available keys: ${JSON.stringify(Object.keys(result))}`);
      return [];
    }
    
    // Process each item to add categories and tags
    return items.map(item => {
      // Use the source's category, or a fallback if it's not defined
      const sourceCategory = ensureString(defaultCategory || 'Uncategorized');
      const { categories, tags } = categorizeNewsItem(item, sourceCategory);
      
      return {
        id: uuidv4(),
        source: ensureString(sourceName),
        title: ensureString(item.title),
        summary: ensureString(item.summary),
        url: ensureString(item.url),
        pubDate: ensureString(new Date(item.pubDate).toISOString()),
        categories,
        tags
      };
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
}

// Function to sanitize items for React
function sanitizeItems(items) {
  return items.map(item => ({
    id: ensureString(item.id),
    source: ensureString(item.source || ''),
    title: ensureString(item.title || ''),
    summary: ensureString(item.summary || ''),
    url: ensureString(item.url || ''),
    pubDate: ensureString(item.pubDate || new Date().toISOString()),
    categories: Array.isArray(item.categories) 
      ? item.categories.map(cat => ensureString(cat || '')) 
      : [],
    tags: Array.isArray(item.tags) 
      ? item.tags.map(tag => ensureString(tag || '')) 
      : []
  }));
}

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Endpoint to fetch and aggregate news from all sources
app.get('/api/news', async (req, res) => {
  try {
    console.log('Fetching news from all sources...');
    console.log('NEWS_SOURCES:', NEWS_SOURCES ? 'defined' : 'undefined', 
                'length:', NEWS_SOURCES ? NEWS_SOURCES.length : 0);
    
    // Try to fetch from real sources
    const newsItems = [];
    
    // Handle the case where NEWS_SOURCES might be undefined
    const fetchPromises = (NEWS_SOURCES || []).map(async (source) => {
      try {
        console.log(`Fetching from ${source.name}...`);
        
        // Add a check for missing feed URL
        if (!source.feedUrl) {
          console.error(`Missing feedUrl for ${source.name}`);
          return [];
        }
        
        const response = await axios.get(source.feedUrl, {
          timeout: 15000, // 15 second timeout
          headers: {
            'User-Agent': 'InPulse Cybersecurity News Aggregator/1.0'
          }
        });
        
        // Check if we got actual XML/RSS data
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('xml') && !contentType.includes('rss') && 
            !response.data.includes('<rss') && !response.data.includes('<feed') &&
            !response.data.includes('<?xml')) {
          console.error(`Response from ${source.name} doesn't appear to be RSS/XML`);
          return [];
        }
        
        const items = parseRss(response.data, source.name, source.defaultCategory || source.category);
        console.log(`Successfully fetched ${items.length} items from ${source.name}`);
        return items;
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error.message);
        return [];
      }
    });
    
    // Wait for all fetch operations to complete
    const results = await Promise.allSettled(fetchPromises);
    
    // Collect successful results
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        newsItems.push(...result.value);
      }
    });
    
    // Sort by date (newest first)
    newsItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    console.log(`Total news items fetched: ${newsItems.length}`);
    
    // Sanitize the news items to ensure all properties are safe for React
    const sanitizedItems = sanitizeItems(newsItems);
    
    // If no items could be fetched, return demo data
    if (sanitizedItems.length === 0) {
      console.log('No real news items found, returning demo data');
      return res.json(sanitizeItems(demoData));
    }
    
    // Return the aggregated news items
    res.json(sanitizedItems);
  } catch (error) {
    console.error('Error in /api/news endpoint:', error);
    console.log('demoData:', demoData ? 'defined' : 'undefined');
    
    // Safely return demo data or empty array
    res.json(sanitizeItems(demoData || []));
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  // Only for API routes, handle normally
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});