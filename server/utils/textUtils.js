/**
 * Text utility functions for preprocessing resume and job description text.
 * Handles tokenization, stopword removal, normalization, and cleaning.
 */

// Common English stopwords to filter during keyword extraction
const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','up','about','into','through','during','including','until',
  'against','among','throughout','despite','towards','upon','concerning',
  'is','are','was','were','be','been','being','have','has','had','do','does',
  'did','will','would','could','should','may','might','shall','can','need',
  'dare','ought','used','able','i','me','my','myself','we','our','ours',
  'ourselves','you','your','yours','yourself','yourselves','he','him','his',
  'himself','she','her','hers','herself','it','its','itself','they','them',
  'their','theirs','themselves','what','which','who','whom','this','that',
  'these','those','am','s','t','re','ve','d','ll','m','o','y','ain','aren',
  'couldn','didn','doesn','hadn','hasn','haven','isn','let','mustn','needn',
  'shan','shouldn','wasn','weren','won','wouldn','not','no','nor','so','yet',
  'both','either','neither','not','only','own','same','than','too','very',
  'just','because','as','until','while','although','though','since','unless',
  'however','therefore','thus','hence','consequently','accordingly','also',
  'furthermore','moreover','nevertheless','nonetheless','meanwhile','whether',
  'if','then','else','when','where','why','how','all','any','each','every',
  'few','more','most','other','some','such','over','under','again','further',
  'once','any','then','there','here','get','got','make','made','take','took',
  'go','went','come','came','know','knew','think','thought','see','saw',
  'use','used','find','found','give','gave','tell','told','work','works',
  'call','called','keep','kept','let','lets','put','set','seem','seemed',
  'year', 'years', 'time', 'times', 'way', 'ways', 'day', 'days'
]);

/**
 * Cleans raw text: lowercases, removes punctuation/symbols, collapses whitespace.
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\-+#.]/g, ' ')   // keep word chars, spaces, dashes, +, #, .
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into individual words.
 */
function tokenize(text) {
  return cleanText(text)
    .split(/\s+/)
    .filter(token => token.length > 1);  // Remove single characters
}

/**
 * Removes stopwords from a token array.
 */
function removeStopwords(tokens) {
  return tokens.filter(token => !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

/**
 * Gets filtered tokens (tokenized + stopwords removed).
 */
function getFilteredTokens(text) {
  return removeStopwords(tokenize(text));
}

/**
 * Extracts unique keywords from text as a Set.
 */
function extractKeywords(text) {
  const tokens = getFilteredTokens(text);
  return new Set(tokens);
}

/**
 * Build a term frequency map from tokens.
 */
function buildTermFrequency(tokens) {
  const freq = {};
  for (const token of tokens) {
    freq[token] = (freq[token] || 0) + 1;
  }
  return freq;
}

/**
 * Extract n-grams (bigrams and trigrams) from tokens array.
 * Useful for capturing multi-word technical terms.
 */
function extractNgrams(tokens, n = 2) {
  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Normalizes a keyword for comparisons (lowercase, trimmed).
 */
function normalizeKeyword(kw) {
  return kw.toLowerCase().trim();
}

/**
 * Extracts sections from resume text by heading patterns.
 * Returns { skills, experience, education, summary, certifications, projects }
 */
function extractSections(text) {
  const sections = {
    summary: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
    projects: '',
  };

  const sectionPatterns = {
    summary: /(?:summary|objective|about me|profile|overview)/i,
    skills: /(?:skills|technical skills|core competencies|technologies|tech stack|expertise|proficiencies)/i,
    experience: /(?:experience|work experience|employment|professional experience|work history|career)/i,
    education: /(?:education|academic|qualification|degree|university|college)/i,
    certifications: /(?:certifications?|certificates?|credentials|licenses?)/i,
    projects: /(?:projects?|portfolio|works?|contributions?)/i,
  };

  // Split text into lines and iterate
  const lines = text.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a section header (short line matching known patterns)
    if (trimmed.length < 80) {
      let matched = false;
      for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(trimmed)) {
          // Save previous section's content
          if (currentSection && currentContent.length > 0) {
            sections[currentSection] += currentContent.join(' ');
            currentContent = [];
          }
          currentSection = sectionName;
          matched = true;
          break;
        }
      }
      if (!matched && currentSection) {
        currentContent.push(trimmed);
      }
    } else if (currentSection) {
      currentContent.push(trimmed);
    }
  }

  // Save final section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] += currentContent.join(' ');
  }

  // If sections are empty, use the full text as a fallback
  const total = Object.values(sections).join('').trim();
  if (!total) {
    sections.skills = text;
    sections.experience = text;
  }

  return sections;
}

module.exports = {
  cleanText,
  tokenize,
  removeStopwords,
  getFilteredTokens,
  extractKeywords,
  buildTermFrequency,
  extractNgrams,
  normalizeKeyword,
  extractSections,
  STOPWORDS,
};
