// server-simple.js
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

// List of cybersecurity news sources with their RSS feeds
const NEWS_SOURCES = [
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    defaultCategory: 'Threats'
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    defaultCategory: 'Incidents'
  },
  {
    name: 'Threatpost',
    url: 'https://threatpost.com/feed/',
    defaultCategory: 'Threats'
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/rss.xml',
    defaultCategory: 'Threats'
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    defaultCategory: 'Vulnerabilities'
  },
  {
    name: 'SecurityWeek',
    url: 'https://feeds.feedburner.com/securityweek',
    defaultCategory: 'Vulnerabilities'
  },
  {
    name: 'US-CERT Alerts',
    url: 'https://us-cert.cisa.gov/ncas/alerts.xml',
    defaultCategory: 'Advisories'
  },
  {
    name: 'CISA Bulletins',
    url: 'https://www.cisa.gov/uscert/ncas/bulletins.xml',
    defaultCategory: 'Advisories'
  },
  {
    name: 'NCSC UK',
    url: 'https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml',
    defaultCategory: 'Advisories'
  },

  { name: 'NCSC NL News',
    url: 'https://feeds.ncsc.nl/nieuws.rss',
    defaultCategory: 'Advisories'
  },

  { name: 'NCSC NL Advisories',
    url: 'https://advisories.ncsc.nl/rss/advisories',
    defaultCategory: 'Advisories'
  }
];

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

// Function to clean HTML from text
function cleanHtml(html) {
  if (!html) return '';
  
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
  categories.add(defaultCategory);
  
  // Combine title and summary for analysis
  const content = `${item.title} ${item.summary}`.toLowerCase();
  
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
    cveMatches.slice(0, 3).forEach(cve => tags.add(cve.toUpperCase()));
  }
  
  // Add default tags if none found
  if (tags.size === 0) {
    tags.add(defaultCategory);
  }
  
  return {
    categories: Array.from(categories),
    tags: Array.from(tags)
  };
}

// Parse RSS feed and extract items - simplified version
function parseRss(xmlContent, sourceName, defaultCategory) {
  try {
    // Create parser with options
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      // additional options if needed
    });
    
    // Parse the XML
    const result = parser.parse(xmlContent);
    
    // Debug the structure
    console.log(`Data from ${sourceName} parsed. Top-level keys:`, Object.keys(result));
    
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
        const title = item.title || 'No Title';
        const link = item.link || '';
        const description = item.description || '';
        const pubDate = item.pubDate || new Date().toISOString();
        
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
        const title = entry.title || 'No Title';
        let link = '';
        
        if (entry.link) {
          // Handle different link formats
          if (typeof entry.link === 'string') {
            link = entry.link;
          } else if (Array.isArray(entry.link)) {
            link = entry.link[0]?.href || '';
          } else {
            link = entry.link.href || '';
          }
        }
        
        const content = entry.content || entry.summary || '';
        const pubDate = entry.published || entry.updated || new Date().toISOString();
        
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
      const { categories, tags } = categorizeNewsItem(item, defaultCategory);
      
      return {
        id: uuidv4(),
        source: sourceName,
        title: item.title,
        summary: item.summary,
        url: item.url,
        pubDate: new Date(item.pubDate).toISOString(),
        categories,
        tags
      };
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return [];
  }
}

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Endpoint to fetch and aggregate news from all sources
app.get('/api/news', async (req, res) => {
  try {
    console.log('Fetching news from all sources...');
    
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
    
    // Try to fetch from real sources
    const newsItems = [];
    
    const fetchPromises = NEWS_SOURCES.map(async (source) => {
      try {
        console.log(`Fetching from ${source.name}...`);
        const response = await axios.get(source.url, {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'InPulse Cybersecurity News Aggregator/1.0'
          }
        });
        
        const items = parseRss(response.data, source.name, source.defaultCategory);
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
    
    // If no items could be fetched, return demo data
    if (newsItems.length === 0) {
      console.log('No real news items found, returning demo data');
      return res.json(demoData);
    }
    
    // Return the aggregated news items
    res.json(newsItems);
  } catch (error) {
    console.error('Error in /api/news endpoint:', error);
    // Return demo data in case of error
    res.json(demoData);
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