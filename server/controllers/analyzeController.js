/**
 * Analysis Controller — orchestrates the full resume analysis pipeline.
 * Called by the Express route on POST /api/analyze.
 *
 * Pipeline:
 *  1. Extract text from uploaded file (PDF / DOCX / TXT)
 *  2. Run GPT-4o AI analysis (primary engine — semantic, holistic)
 *  3. Run NLP scoring engine (secondary — fast, deterministic)
 *  4. Merge results: AI scores take precedence when available
 *  5. Generate rule-based suggestions as supplement
 *  6. Return unified response
 */

const path = require('path');
const fs = require('fs');
const { extractTextFromFile } = require('../services/extractionService');
const { analyzeResume } = require('../services/scoringService');
const { generateSuggestions } = require('../services/suggestionService');
const { runAIAnalysis } = require('../services/aiAnalysisService');

/**
 * POST /api/analyze
 *
 * Expects:
 *  - multipart/form-data with field "resume" (file)
 *  - form field "jobDescription" (string)
 *
 * Returns:
 *  - JSON with full analysis result
 */
async function analyzeResumeController(req, res) {
  const uploadedFilePath = req.file?.path;

  try {
    // --- 1. Validate inputs ---
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded. Please attach a PDF or DOCX file.',
      });
    }

    const jobDescription = (req.body.jobDescription || '').trim();
    if (!jobDescription || jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Job description is too short. Please paste the full job posting (at least 50 characters).',
      });
    }

    // --- 2. Extract text from file ---
    console.log(`[Analyze] Extracting text from: ${req.file.originalname} (${req.file.mimetype})`);
    const resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({
        success: false,
        error: 'Could not extract readable text from your resume. Please ensure the file is not password-protected or image-only.',
      });
    }

    // --- 3. Run both engines in parallel ---
    console.log(`[Analyze] Running analysis... (resume: ${resumeText.length} chars, JD: ${jobDescription.length} chars)`);

    const [aiResult, nlpResult] = await Promise.all([
      runAIAnalysis(resumeText, jobDescription),          // GPT-4o (async, may be null)
      Promise.resolve(analyzeResume(resumeText, jobDescription)), // NLP (sync, always available)
    ]);

    const aiEnabled = !!aiResult;
    console.log(`[Analyze] AI analysis: ${aiEnabled ? 'SUCCESS' : 'SKIPPED (no API key or error)'}`);

    // --- 4. Generate rule-based suggestions (lightweight supplement) ---
    console.log('[Analyze] Generating suggestions...');
    const { ruleBased } = await generateSuggestions(nlpResult, resumeText, jobDescription);

    // --- 5. Merge results ---
    // When AI is available, use AI scores as source of truth
    const finalScore = aiEnabled ? aiResult.overall_score : nlpResult.score;

    const section_scores = aiEnabled
      ? aiResult.section_scores
      : nlpResult.section_scores;

    // For keyword lists: prefer AI matched_skills, fall back to NLP matched_keywords
    const matched_keywords = aiEnabled
      ? aiResult.matched_skills.map(m => m.skill)
      : nlpResult.matched_keywords;

    const missing_keywords = aiEnabled
      ? aiResult.missing_critical.map(m => m.skill)
      : nlpResult.missing_keywords;

    const keyword_match_pct = aiEnabled
      ? aiResult.semantic_keyword_match_pct
      : nlpResult.keyword_match_pct;

    // --- 6. Build response ---
    const response = {
      success: true,
      data: {
        score: finalScore,
        matched_keywords,
        missing_keywords,
        section_scores,
        similarity_score: nlpResult.similarity_score, // TF-IDF always available
        keyword_match_pct,
        resume_word_count: nlpResult.resume_word_count,
        jd_word_count: nlpResult.jd_word_count,

        // AI-exclusive enrichments (null when AI not available)
        ai_analysis: aiEnabled
          ? {
              matched_skills: aiResult.matched_skills,       // [{skill, evidence}]
              missing_critical: aiResult.missing_critical,   // [{skill, importance, suggestion}]
              gap_analysis: aiResult.gap_analysis,           // {strengths, weaknesses, opportunities}
              role_fit_summary: aiResult.role_fit_summary,   // string
              resume_bullets: aiResult.resume_bullets,       // ready-to-use bullets
              quick_wins: aiResult.quick_wins,               // short action items
              ats_format_issues: aiResult.ats_format_issues, // formatting warnings
            }
          : null,

        suggestions: {
          rule_based: ruleBased,
          ai: [],  // AI suggestions are now embedded in ai_analysis above
        },

        meta: {
          filename: req.file.originalname,
          file_size_kb: Math.round(req.file.size / 1024),
          analyzed_at: new Date().toISOString(),
          ai_enabled: aiEnabled,
          ai_model: aiEnabled ? 'gpt-4o' : null,
        },
      },
    };

    console.log(`[Analyze] Complete! Score: ${finalScore}/100 | AI: ${aiEnabled}`);
    return res.status(200).json(response);

  } catch (err) {
    console.error('[Analyze] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred during analysis.',
    });
  } finally {
    // Always clean up uploaded file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
}

module.exports = { analyzeResumeController };
