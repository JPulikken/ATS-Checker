/**
 * Scoring Engine — the core of the ATS Resume Checker.
 *
 * Implements 4 levels of analysis:
 *  L1 - Keyword extraction + tokenization
 *  L2 - Keyword match percentage
 *  L3 - Weighted section-wise scoring
 *  L4 - TF-IDF cosine similarity (using 'natural' package)
 */

const natural = require('natural');
const {
  getFilteredTokens,
  extractKeywords,
  buildTermFrequency,
  extractNgrams,
  extractSections,
  normalizeKeyword,
} = require('../utils/textUtils');

const {
  allTechSkills,
  softSkills,
  experienceIndicators,
  education: educationKeywords,
  certifications,
} = require('../utils/keywords');

// Weights for each section in final score
const SECTION_WEIGHTS = {
  skills: 0.40,
  experience: 0.30,
  tools: 0.20,
  education: 0.10,
};

// =============================================================================
// LEVEL 1 — Tokenization & Keyword Extraction
// =============================================================================

/**
 * Extracts high-value keywords from text using unigrams + bigrams.
 * Combines regular filtered tokens with domain-specific keyword detection.
 */
function extractAllKeywords(text) {
  const tokens = getFilteredTokens(text);
  const unigrams = new Set(tokens);

  // Also extract bigrams for multi-word terms like "machine learning"
  const bigrams = extractNgrams(tokens, 2);
  const combined = new Set([...unigrams, ...bigrams]);

  return combined;
}

// =============================================================================
// LEVEL 2 — Keyword Match Percentage
// =============================================================================

/**
 * Computes matched and missing keywords between resume and JD.
 * @param {Set<string>} resumeKeywords
 * @param {Set<string>} jdKeywords
 * @returns {{ matched: string[], missing: string[], matchPct: number }}
 */
function computeKeywordMatch(resumeKeywords, jdKeywords) {
  const matched = [];
  const missing = [];

  for (const keyword of jdKeywords) {
    // Check exact match or if any resume keyword contains it
    const found =
      resumeKeywords.has(keyword) ||
      [...resumeKeywords].some(rk =>
        rk.includes(keyword) || keyword.includes(rk)
      );

    if (found) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchPct = jdKeywords.size > 0
    ? Math.round((matched.length / jdKeywords.size) * 100)
    : 0;

  return { matched, missing, matchPct };
}

// =============================================================================
// LEVEL 3 — Weighted Section Scoring
// =============================================================================

/**
 * Scores the Skills section: how many tech skills from JD appear in resume skills.
 */
function scoreSkills(resumeSections, jdTokens) {
  const resumeSkillTokens = getFilteredTokens(resumeSections.skills || '');
  const resumeSkillsSet = new Set(resumeSkillTokens);

  // Also add bigrams from skills section
  const skillBigrams = new Set(extractNgrams(resumeSkillTokens, 2));
  const allResumeSkills = new Set([...resumeSkillsSet, ...skillBigrams]);

  // Filter JD tokens to only tech-skill related ones
  const jdTechSkills = jdTokens.filter(t =>
    allTechSkills.includes(t) || allTechSkills.some(s => s.includes(t))
  );

  if (jdTechSkills.length === 0) {
    // Fall back to general skills presence
    const techInResume = allTechSkills.filter(skill =>
      allResumeSkills.has(skill) ||
      [...allResumeSkills].some(rs => rs.includes(skill))
    );
    return Math.min(100, Math.round((techInResume.length / allTechSkills.length) * 300));
  }

  const matchedTech = jdTechSkills.filter(t =>
    allResumeSkills.has(t) ||
    [...allResumeSkills].some(rs => rs.includes(t) || t.includes(rs))
  );

  return Math.round((matchedTech.length / jdTechSkills.length) * 100);
}

/**
 * Scores the Experience section: checks action verbs and quantified achievements.
 */
function scoreExperience(resumeSections, jdText) {
  const expText = (resumeSections.experience || '') + ' ' + (resumeSections.summary || '');
  const expTokens = getFilteredTokens(expText);
  const expSet = new Set(expTokens);

  // Check for action verbs (experience indicators)
  const foundVerbs = experienceIndicators.filter(verb =>
    expSet.has(verb) || expText.toLowerCase().includes(verb)
  );
  const verbScore = Math.min(50, Math.round((foundVerbs.length / 15) * 50)); // max 50 points

  // Check for numbers/metrics (quantified achievements)
  const numbersPattern = /\b\d+[\%\+\-×x]?|\$[\d,]+|\d+[\w]?[\s]*(percent|million|billion|k\b)/gi;
  const metricsFound = (expText.match(numbersPattern) || []).length;
  const metricsScore = Math.min(30, metricsFound * 5); // max 30 points

  // Overlap with JD experience terms
  const jdExpTokens = getFilteredTokens(jdText);
  const jdExpSet = new Set(jdExpTokens);
  const overlapCount = expTokens.filter(t => jdExpSet.has(t)).length;
  const overlapScore = Math.min(20, Math.round((overlapCount / Math.max(jdExpTokens.length, 1)) * 100));

  return Math.min(100, verbScore + metricsScore + overlapScore);
}

/**
 * Scores the Tools section: how many tools/tech from JD appear in resume.
 */
function scoreTools(resumeText, jdTokens) {
  const resumeTokens = getFilteredTokens(resumeText);
  const resumeSet = new Set(resumeTokens);
  const resumeBigrams = new Set(extractNgrams(resumeTokens, 2));
  const allResumeTerms = new Set([...resumeSet, ...resumeBigrams]);

  // All domain tech keywords from JD
  const jdTools = jdTokens.filter(t =>
    allTechSkills.includes(t) ||
    allTechSkills.some(s => s === t || s.includes(t))
  );

  if (jdTools.length === 0) {
    const toolsInResume = allTechSkills.filter(t =>
      allResumeTerms.has(t) || [...allResumeTerms].some(r => r.includes(t))
    );
    return Math.min(100, Math.round((toolsInResume.length / 30) * 100));
  }

  const matchedTools = jdTools.filter(t =>
    allResumeTerms.has(t) || [...allResumeTerms].some(r => r.includes(t) || t.includes(r))
  );

  return Math.round((matchedTools.length / jdTools.length) * 100);
}

/**
 * Scores the Education section.
 */
function scoreEducation(resumeSections) {
  const eduText = resumeSections.education || '';
  if (!eduText.trim()) return 0;

  const eduTokens = getFilteredTokens(eduText);
  const eduSet = new Set(eduTokens);

  const foundEduKeywords = educationKeywords.filter(kw =>
    eduSet.has(kw) || eduText.toLowerCase().includes(kw)
  );

  // Has a degree mentioned?
  const hasDegree = /bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|b\.?e\.?|b\.?tech|m\.?tech/i.test(eduText);

  const keywordScore = Math.min(70, Math.round((foundEduKeywords.length / 8) * 70));
  const degreeBonus = hasDegree ? 30 : 0;

  return Math.min(100, keywordScore + degreeBonus);
}

// =============================================================================
// LEVEL 4 — TF-IDF + Cosine Similarity
// =============================================================================

/**
 * Computes TF-IDF cosine similarity between resume and job description.
 * Uses the 'natural' npm package's TfIdf implementation.
 * @returns {number} Similarity score 0–100
 */
function computeTfIdfSimilarity(resumeText, jdText) {
  try {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    tfidf.addDocument(resumeText);
    tfidf.addDocument(jdText);

    // Build term vectors for both documents
    const terms = new Set();
    tfidf.listTerms(0).forEach(item => terms.add(item.term));
    tfidf.listTerms(1).forEach(item => terms.add(item.term));

    const termsArr = [...terms];

    const vec1 = termsArr.map(term => tfidf.tfidf(term, 0));
    const vec2 = termsArr.map(term => tfidf.tfidf(term, 1));

    // Cosine similarity
    const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

    if (mag1 === 0 || mag2 === 0) return 0;

    const similarity = dotProduct / (mag1 * mag2);
    return Math.round(similarity * 100);
  } catch (err) {
    console.error('TF-IDF similarity error:', err.message);
    return 0;
  }
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

/**
 * Primary scoring function that orchestrates all levels of analysis.
 *
 * @param {string} resumeText - Full extracted resume text
 * @param {string} jdText - Full job description text
 * @returns {{
 *   score: number,
 *   matched_keywords: string[],
 *   missing_keywords: string[],
 *   section_scores: { skills: number, experience: number, tools: number, education: number },
 *   similarity_score: number,
 *   resume_word_count: number,
 *   jd_word_count: number,
 * }}
 */
function analyzeResume(resumeText, jdText) {
  // ---------- L1: Extract keywords ----------
  const resumeKeywords = extractAllKeywords(resumeText);
  const jdKeywords = extractAllKeywords(jdText);

  // Use only "meaningful" JD keywords (length >= 3, filter very common words)
  const filteredJdKeywords = new Set(
    [...jdKeywords].filter(kw => kw.length >= 3 && kw.length <= 40)
  );

  // ---------- L2: Keyword match ----------
  const { matched, missing, matchPct } = computeKeywordMatch(resumeKeywords, filteredJdKeywords);

  // ---------- L3: Section-wise scoring ----------
  const resumeSections = extractSections(resumeText);
  const jdTokens = getFilteredTokens(jdText);

  const skillsScore = scoreSkills(resumeSections, jdTokens);
  const experienceScore = scoreExperience(resumeSections, jdText);
  const toolsScore = scoreTools(resumeText, jdTokens);
  const educationScore = scoreEducation(resumeSections);

  const section_scores = {
    skills: skillsScore,
    experience: experienceScore,
    tools: toolsScore,
    education: educationScore,
  };

  // Weighted section score
  const weightedSectionScore =
    skillsScore * SECTION_WEIGHTS.skills +
    experienceScore * SECTION_WEIGHTS.experience +
    toolsScore * SECTION_WEIGHTS.tools +
    educationScore * SECTION_WEIGHTS.education;

  // ---------- L4: TF-IDF Cosine Similarity ----------
  const similarityScore = computeTfIdfSimilarity(resumeText, jdText);

  // ---------- Final Composite Score ----------
  // Blend: 40% keyword match, 40% weighted sections, 20% TF-IDF similarity
  const compositeScore = Math.round(
    matchPct * 0.40 +
    weightedSectionScore * 0.40 +
    similarityScore * 0.20
  );

  // Cap between 0–100
  const finalScore = Math.max(0, Math.min(100, compositeScore));

  // Sort keywords: shorter/more relevant first for better UX
  const sortedMatched = matched
    .filter(k => k.length >= 3)
    .sort((a, b) => a.length - b.length)
    .slice(0, 60);

  const sortedMissing = missing
    .filter(k => k.length >= 3)
    .sort((a, b) => a.length - b.length)
    .slice(0, 40);

  return {
    score: finalScore,
    matched_keywords: sortedMatched,
    missing_keywords: sortedMissing,
    section_scores,
    similarity_score: similarityScore,
    resume_word_count: resumeText.split(/\s+/).length,
    jd_word_count: jdText.split(/\s+/).length,
    keyword_match_pct: matchPct,
  };
}

module.exports = { analyzeResume };
