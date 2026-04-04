/**
 * AI Analysis Service — GPT-4o powered deep resume analysis.
 *
 * This replaces naive keyword matching with semantic understanding:
 *  - Recognises synonyms (ReactJS ↔ React, ML ↔ Machine Learning)
 *  - Evaluates experience quality, not just presence of words
 *  - Returns a structured analysis with scores, gaps, and ready-to-use resume bullets
 */

const { OpenAI } = require('openai');

// ---------------------------------------------------------------------------
// Build the structured analysis prompt
// ---------------------------------------------------------------------------

function buildAnalysisPrompt(resumeText, jdText) {
  // Truncate to stay well within context window while keeping max signal
  const resumeSnip = resumeText.slice(0, 3000);
  const jdSnip = jdText.slice(0, 2000);

  return `You are an expert ATS (Applicant Tracking System) consultant and senior technical recruiter with 15+ years of experience. Your job is to perform a comprehensive, semantic analysis of a candidate's resume against a job description.

Go BEYOND simple keyword matching — evaluate conceptual alignment, experience quality, transferable skills, and genuine role-fit.

---

JOB DESCRIPTION:
${jdSnip}

---

CANDIDATE RESUME:
${resumeSnip}

---

Return a SINGLE valid JSON object (no markdown, no code fences) with EXACTLY this structure:

{
  "overall_score": <integer 0-100, holistic ATS + role-fit score>,
  "semantic_keyword_match_pct": <integer 0-100, % of JD concepts covered semantically>,

  "section_scores": {
    "skills": <integer 0-100>,
    "experience": <integer 0-100>,
    "tools": <integer 0-100>,
    "education": <integer 0-100>
  },

  "matched_skills": [
    { "skill": "<exact JD term>", "evidence": "<short quote or paraphrase from resume proving it>" }
  ],

  "missing_critical": [
    { "skill": "<term from JD>", "importance": "high|medium", "suggestion": "<how to address it>" }
  ],

  "gap_analysis": {
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "opportunities": ["<opportunity 1>", "<opportunity 2>"]
  },

  "role_fit_summary": "<2-3 sentence plain-English summary of how well the candidate fits this specific role, mentioning role title if visible>",

  "resume_bullets": [
    "<ready-to-paste bullet point that would improve the resume for this JD — starts with strong action verb, includes metric, references a JD keyword>",
    "<bullet 2>",
    "<bullet 3>",
    "<bullet 4>",
    "<bullet 5>"
  ],

  "quick_wins": [
    "<single actionable tip — max 15 words>",
    "<quick win 2>",
    "<quick win 3>"
  ],

  "ats_format_issues": [
    "<potential formatting issue spotted, or empty array if none>"
  ]
}

Rules:
- Be accurate, not inflated. A low score on a bad match is MORE helpful than a fake high score.
- matched_skills: include 5-15 items. Only include if there is real evidence in the resume.
- missing_critical: include 3-10 items. Prioritise skills that appear multiple times in the JD.
- resume_bullets: write bullets that EXACTLY match the JD's language and requirements. Each bullet must be realistic for the candidate's apparent background.
- Return ONLY the JSON object, no extra text.`;
}

// ---------------------------------------------------------------------------
// Call GPT-4o
// ---------------------------------------------------------------------------

async function runAIAnalysis(resumeText, jdText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null; // Gracefully skip — caller will use NLP fallback
  }

  const openai = new OpenAI({ apiKey });

  try {
    console.log('[AI] Calling GPT-4o for deep semantic analysis...');
    const start = Date.now();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert ATS consultant. Always respond with a single, valid JSON object. No markdown, no code blocks.',
        },
        {
          role: 'user',
          content: buildAnalysisPrompt(resumeText, jdText),
        },
      ],
      temperature: 0.2,          // Low temperature = consistent, factual output
      max_tokens: 2000,
      response_format: { type: 'json_object' }, // Enforce JSON mode
    });

    const elapsed = Date.now() - start;
    console.log(`[AI] GPT-4o responded in ${elapsed}ms`);

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    return validateAndNormalise(parsed);
  } catch (err) {
    console.error('[AI] GPT-4o analysis error:', err.message);
    return null; // Fallback to NLP
  }
}

// ---------------------------------------------------------------------------
// Validate + normalise AI output so the rest of the code can trust the shape
// ---------------------------------------------------------------------------

function validateAndNormalise(ai) {
  const clamp = (v, min = 0, max = 100) =>
    Math.max(min, Math.min(max, Number(v) || 0));

  return {
    overall_score: clamp(ai.overall_score),
    semantic_keyword_match_pct: clamp(ai.semantic_keyword_match_pct),

    section_scores: {
      skills: clamp(ai.section_scores?.skills),
      experience: clamp(ai.section_scores?.experience),
      tools: clamp(ai.section_scores?.tools),
      education: clamp(ai.section_scores?.education),
    },

    matched_skills: Array.isArray(ai.matched_skills)
      ? ai.matched_skills.slice(0, 20).map(item => ({
          skill: String(item.skill || ''),
          evidence: String(item.evidence || ''),
        }))
      : [],

    missing_critical: Array.isArray(ai.missing_critical)
      ? ai.missing_critical.slice(0, 12).map(item => ({
          skill: String(item.skill || ''),
          importance: item.importance === 'high' ? 'high' : 'medium',
          suggestion: String(item.suggestion || ''),
        }))
      : [],

    gap_analysis: {
      strengths: Array.isArray(ai.gap_analysis?.strengths)
        ? ai.gap_analysis.strengths.slice(0, 4)
        : [],
      weaknesses: Array.isArray(ai.gap_analysis?.weaknesses)
        ? ai.gap_analysis.weaknesses.slice(0, 4)
        : [],
      opportunities: Array.isArray(ai.gap_analysis?.opportunities)
        ? ai.gap_analysis.opportunities.slice(0, 3)
        : [],
    },

    role_fit_summary: String(ai.role_fit_summary || ''),

    resume_bullets: Array.isArray(ai.resume_bullets)
      ? ai.resume_bullets.slice(0, 6).map(b => String(b))
      : [],

    quick_wins: Array.isArray(ai.quick_wins)
      ? ai.quick_wins.slice(0, 5).map(w => String(w))
      : [],

    ats_format_issues: Array.isArray(ai.ats_format_issues)
      ? ai.ats_format_issues.slice(0, 5).map(i => String(i))
      : [],
  };
}

module.exports = { runAIAnalysis };
