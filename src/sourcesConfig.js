const NEWS_SOURCES = [
  {
    name: 'The Hacker News',
    url: 'https://thehackernews.com/',
    feedUrl: 'https://feeds.feedburner.com/TheHackersNews',
    defaultCategory: 'Threats',
    description: 'A leading source of cybersecurity news covering recent attacks, vulnerabilities, and technology trends.',
    category: 'Threats'
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/',
    feedUrl: 'https://krebsonsecurity.com/feed/',
    defaultCategory: 'Incidents',
    description: 'In-depth security news and investigation by Brian Krebs, focusing on cybercrime, data breaches, and security awareness.',
    category: 'Incidents'
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/',
    feedUrl: 'https://www.darkreading.com/rss.xml',
    defaultCategory: 'Threats',
    description: 'Cybersecurity news and analysis focusing on attacks, vulnerabilities, and cyber threats facing enterprises.',
    category: 'Threats'
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/',
    feedUrl: 'https://www.bleepingcomputer.com/feed/',
    defaultCategory: 'Vulnerabilities',
    description: 'Technology news and support site focusing on security, especially ransomware and malware incidents.',
    category: 'Vulnerabilities'
  },
  {
    name: 'SecurityWeek',
    url: 'https://www.securityweek.com/',
    feedUrl: 'https://feeds.feedburner.com/securityweek',
    defaultCategory: 'Vulnerabilities',
    description: 'Security news, insights and analysis covering enterprise security, vulnerabilities, and industry trends.',
    category: 'Vulnerabilities'
  },
  {
    name: 'US-CERT Alerts',
    url: 'https://www.cisa.gov/uscert/ncas/alerts',
    feedUrl: 'https://us-cert.cisa.gov/ncas/alerts.xml',
    defaultCategory: 'Advisories',
    description: 'Official security alerts from the US Cybersecurity and Infrastructure Security Agency (CISA).',
    category: 'Advisories'
  },
  {
    name: 'CISA Bulletins',
    url: 'https://www.cisa.gov/uscert/ncas/bulletins',
    feedUrl: 'https://www.cisa.gov/uscert/ncas/bulletins.xml',
    defaultCategory: 'Advisories',
    description: 'Weekly security bulletins providing summaries of new vulnerabilities from the US CISA.',
    category: 'Advisories'
  },
  {
    name: 'NCSC UK',
    url: 'https://www.ncsc.gov.uk/',
    feedUrl: 'https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml',
    defaultCategory: 'Advisories',
    description: 'Security guidance and alerts from the UK National Cyber Security Centre.',
    category: 'Advisories'
  },

  { name: 'NCSC NL News',
    url: 'https://ncsc.nl/',
    feedUrl: 'https://feeds.ncsc.nl/nieuws.rss',
    defaultCategory: 'Advisories',
    description: 'Security news from the Dutch National Cyber Security Centre.',
    category: 'Advisories'
  },

  { name: 'NCSC NL Advisories',
    url: 'https://ncsc.nl',
    feedUrl: 'https://advisories.ncsc.nl/rss/advisories',
    defaultCategory: 'Advisories',
    description: 'Security advisories from the Dutch National Cyber Security Centre.',
    category: 'Advisories'
  },
{
  name: 'The Record by Recorded Future',
  url: 'https://therecord.media/',
  feedUrl: 'https://therecord.media/feed/',
  defaultCategory: 'Threats',
  description: 'Cybersecurity news with a focus on state-sponsored attacks, cyber espionage, and advanced threats.',
  category: 'Threats'
},
{
  name: 'Security Affairs',
  url: 'https://securityaffairs.com/',
  feedUrl: 'https://securityaffairs.com/feed',
  defaultCategory: 'Incidents',
  description: 'Information security news, focusing on cyber crime, cyber warfare, and cyber espionage.',
  category: 'Incidents'
},
{
  name: 'Graham Cluley',
  url: 'https://grahamcluley.com/',
  feedUrl: 'https://grahamcluley.com/feed/',
  defaultCategory: 'Threats',
  description: 'Security news and opinions from cybersecurity veteran Graham Cluley.',
  category: 'Threats'
},
{
  name: 'ZDNet Security',
  url: 'https://www.zdnet.com/topic/security/',
  feedUrl: 'https://www.zdnet.com/topic/security/rss.xml',
  defaultCategory: 'Incidents',
  description: 'Technology news with a strong focus on cybersecurity topics and enterprise security.',
  category: 'Incidents'
},
{
  name: 'Schneier on Security',
  url: 'https://schneier.com/',
  feedUrl: 'https://www.schneier.com/feed/atom/',
  defaultCategory: 'Advisories',
  description: 'Security commentary from renowned security expert Bruce Schneier.',
  category: 'Advisories'
},
{
  name: 'Microsoft Security Response Center',
  url: 'https://msrc.microsoft.com/',
  feedUrl: 'https://msrc-blog.microsoft.com/feed/',
  defaultCategory: 'Advisories',
  description: 'Official security guidance and vulnerability information from Microsoft.',
  category: 'Advisories'
},
{
  name: 'SANS Internet Storm Center',
  url: 'https://isc.sans.edu/',
  feedUrl: 'https://isc.sans.edu/rssfeed.xml',
  defaultCategory: 'Threats',
  description: 'Global cooperative cyber threat monitoring and alert system.',
  category: 'Threats'
},
{
  name: 'Naked Security by Sophos',
  url: 'https://nakedsecurity.sophos.com/',
  feedUrl: 'https://nakedsecurity.sophos.com/feed/',
  defaultCategory: 'Threats',
  description: 'Security news, opinion, advice and research from Sophos.',
  category: 'Threats'
},
{
  name: 'Infosecurity Magazine',
  url: 'https://www.infosecurity-magazine.com/',
  feedUrl: 'https://www.infosecurity-magazine.com/rss/news/',
  defaultCategory: 'Incidents',
  description: 'Information security industry publication covering threats, compliance, and best practices.',
  category: 'Incidents'
},
{
  name: 'ThreatPost',
  url: 'https://threatpost.com/',
  feedUrl: 'https://threatpost.com/feed/',
  defaultCategory: 'Threats',
  description: 'Security news service covering IT and business security.',
  category: 'Threats'
},
{
  name: 'Google Project Zero',
  url: 'https://googleprojectzero.blogspot.com/',
  feedUrl: 'https://googleprojectzero.blogspot.com/feeds/posts/default',
  defaultCategory: 'Vulnerabilities',
  description: 'Google\'s vulnerability research team blog with detailed technical analysis.',
  category: 'Vulnerabilities'
},
{
  name: 'CERT/CC Vulnerability Notes',
  url: 'https://www.kb.cert.org/vuls/',
  feedUrl: 'https://www.kb.cert.org/vuls/atomfeed',
  defaultCategory: 'Vulnerabilities',
  description: 'Vulnerability notes from the CERT Coordination Center.',
  category: 'Vulnerabilities'
},
{
  name: 'Cisco Talos Intelligence',
  url: 'https://blog.talosintelligence.com/',
  feedUrl: 'https://blog.talosintelligence.com/feed/',
  defaultCategory: 'Threats',
  description: 'Threat intelligence blog from Cisco\'s security research team.',
  category: 'Threats'
},
{
  name: 'FireEye Threat Research',
  url: 'https://www.fireeye.com/blog/threat-research.html',
  feedUrl: 'https://www.trellix.com/rss/research.xml',
  defaultCategory: 'Threats',
  description: 'Advanced threat research and analysis from FireEye.',
  category: 'Threats'
}
];

module.exports = { NEWS_SOURCES };