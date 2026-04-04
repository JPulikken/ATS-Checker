/**
 * Suggestion Engine — generates deterministic, rule-based resume improvement tips.
 *
 * AI suggestions are now handled by aiAnalysisService (GPT-4o).
 * This module provides a reliable fallback layer that works even without an API key.
 */

const { getFilteredTokens } = require('../utils/textUtils');
const { experienceIndicators } = require('../utils/keywords');

// =============================================================================
// RULE-BASED SUGGESTION ENGINE
// =============================================================================

/**
 * Generates rule-based improvement suggestions based on scoring results.
 *
 * @param {object} analysisResult - Output from scoringService.analyzeResume()
 * @param {string} resumeText - Raw resume text
 * @param {string} jdText - Raw job description text
 * @returns {string[]} Array of suggestion strings
 */
function generateRuleBasedSuggestions(analysisResult, resumeText, jdText) {
  const suggestions = [];
  const { score, missing_keywords, section_scores, resume_word_count, keyword_match_pct } = analysisResult;

  // --- Overall score feedback ---
  if (score < 40) {
    suggestions.push(
      '🚨 Your resume has a low ATS score. Significant optimization is needed to pass automated screening.'
    );
  } else if (score < 60) {
    suggestions.push(
      '⚠️ Your resume partially matches this job. With a few targeted improvements, you can significantly boost your score.'
    );
  } else if (score < 80) {
    suggestions.push(
      '✅ Good match! Fine-tune your resume with the missing keywords below to push your score higher.'
    );
  } else {
    suggestions.push(
      '🎉 Excellent! Your resume is well-optimized for this job description. Minor tweaks can make it even stronger.'
    );
  }

  // --- Missing keywords ---
  if (missing_keywords.length > 0) {
    const topMissing = missing_keywords.slice(0, 8).join(', ');
    suggestions.push(
      `📌 Add these missing keywords to your resume: ${topMissing}. Incorporate them naturally into your experience bullets or skills section.`
    );
  }

  // --- Keyword match percentage ---
  if (keyword_match_pct < 50) {
    suggestions.push(
      `🔍 Only ${keyword_match_pct}% of job description keywords are present in your resume. Try to match at least 70%+ for better ATS performance.`
    );
  }

  // --- Skills section ---
  if (section_scores.skills < 50) {
    suggestions.push(
      '💡 Your Skills section needs improvement. Create a dedicated "Technical Skills" section listing programming languages, frameworks, tools, and platforms relevant to the role.'
    );
  } else if (section_scores.skills < 75) {
    suggestions.push(
      '🛠️ Expand your Skills section to include more specific technologies mentioned in the job description.'
    );
  }

  // --- Experience section ---
  if (section_scores.experience < 50) {
    suggestions.push(
      '📊 Your Experience section lacks strong action verbs and quantified achievements. Start each bullet with a powerful verb (e.g., "Led", "Delivered", "Optimized") and include metrics like percentages, dollar amounts, or user counts.'
    );
  } else if (section_scores.experience < 70) {
    suggestions.push(
      '📈 Strengthen your Experience section by adding measurable results. For example: "Reduced page load time by 40%" or "Managed a team of 8 engineers".'
    );
  }

  // --- Tools section ---
  if (section_scores.tools < 50) {
    suggestions.push(
      '🔧 Many tools and technologies from the job description are missing in your resume. Add relevant tools (cloud platforms, frameworks, databases) to your Skills or Experience sections.'
    );
  }

  // --- Education section ---
  if (section_scores.education < 30) {
    suggestions.push(
      '🎓 Add or expand your Education section. Include your degree, institution, graduation year, and relevant coursework or academic achievements.'
    );
  }

  // --- Resume length ---
  if (resume_word_count < 200) {
    suggestions.push(
      '📝 Your resume appears too short (under 200 words). A strong resume typically contains 400–800 words. Expand your experience descriptions with more detail.'
    );
  } else if (resume_word_count > 1200) {
    suggestions.push(
      '✂️ Your resume may be too long for ATS systems. Consider condensing to 1–2 pages (ideally 500–800 words) and focusing on your most relevant experience.'
    );
  }

  // --- Action verbs check ---
  const resumeTokens = new Set(getFilteredTokens(resumeText));
  const foundVerbs = experienceIndicators.filter(v => resumeTokens.has(v) || resumeText.toLowerCase().includes(v));
  if (foundVerbs.length < 5) {
    suggestions.push(
      '💪 Use more strong action verbs in your experience bullets. Examples: Architected, Engineered, Delivered, Scaled, Automated, Spearheaded, Championed.'
    );
  }

  // --- ATS formatting tips ---
  suggestions.push(
    '📋 ATS Tip: Use a clean, single-column layout. Avoid tables, text boxes, headers/footers, and images — many ATS systems cannot parse these correctly.'
  );

  suggestions.push(
    '🔑 ATS Tip: Mirror the exact language used in the job description. If they say "REST APIs", use "REST APIs" (not just "API development").'
  );

  return suggestions;
}

// =============================================================================
// COMBINED SUGGESTION GENERATOR
// =============================================================================

/**
 * Generates rule-based suggestions.
 * Note: AI suggestions are now generated upstream in aiAnalysisService.
 *
 * @param {object} analysisResult - From scoringService
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {Promise<{ ruleBased: string[], ai: string[] }>}
 */
async function generateSuggestions(analysisResult, resumeText, jdText) {
  const ruleBased = generateRuleBasedSuggestions(analysisResult, resumeText, jdText);
  return { ruleBased, ai: [] };
}

module.exports = { generateSuggestions, generateRuleBasedSuggestions };
