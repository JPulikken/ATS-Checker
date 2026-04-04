/**
 * ResultsPage — Full ATS analysis results display.
 * Reads from sessionStorage (set by UploadPage after successful analysis).
 *
 * Sections:
 *  - Overview (score + quick stats + role-fit summary)
 *  - AI Insights (gap analysis, matched evidence, quick wins)
 *  - Keywords (matched + missing with AI evidence)
 *  - Section Scores
 *  - Suggestions (rule-based tips + AI resume bullets)
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import SectionScores from '../components/SectionScores';
import SuggestionsPanel from '../components/SuggestionsPanel';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedBullet, setCopiedBullet] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ats_result');
    if (!stored) {
      navigate('/upload');
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      navigate('/upload');
    }
  }, [navigate]);

  if (!result) return null;

  const ai = result.ai_analysis;
  const hasAI = !!ai;

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('ats_result');
    navigate('/upload');
  };

  const handleDownloadReport = () => {
    const report = generateTextReport(result);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(idx);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const navSections = [
    { id: 'overview', label: '📊 Overview' },
    ...(hasAI ? [{ id: 'ai_insights', label: '✨ AI Insights' }] : []),
    { id: 'keywords', label: '🔑 Keywords' },
    { id: 'sections', label: '📈 Sections' },
    { id: 'suggestions', label: '💡 Tips' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }} className="bg-mesh">
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>🎯</span>
            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>ATS<span className="gradient-text">Checker</span></span>
          </button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={handleDownloadReport} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>📥 Download Report</button>
            <button id="new-analysis-btn" onClick={handleNewAnalysis} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>New Analysis</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem' }}>Analysis Report</h1>
            <span className="stat-badge">📄 {result.meta?.filename || 'Resume'}</span>
            <span className="stat-badge">{result.meta?.file_size_kb}KB</span>
            {result.meta?.ai_enabled && (
              <span style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-accent-tertiary)', letterSpacing: '0.05em' }}>
                ✨ AI Enhanced (GPT-4o)
              </span>
            )}
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Analyzed {new Date(result.meta?.analyzed_at).toLocaleString()} · {result.resume_word_count} resume words · {result.jd_word_count} JD words
          </p>
        </div>

        {/* Tab navigation */}
        <div className="tab-nav" style={{ marginBottom: 24, display: 'flex', overflowX: 'auto' }}>
          {navSections.map(s => (
            <button key={s.id} className={`tab-btn ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)} style={{ whiteSpace: 'nowrap' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* OVERVIEW                                                      */}
        {/* ============================================================ */}
        {activeSection === 'overview' && (
          <div className="animate-fade-in-up">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
              {/* Score Card */}
              <div className="glass-card" style={{ gridColumn: 'span 1' }}>
                <ScoreCard score={result.score} />
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
                  <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>📊 Quick Stats</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Keyword Match', value: `${result.keyword_match_pct}%`, good: result.keyword_match_pct >= 70 },
                      { label: 'TF-IDF Score', value: `${result.similarity_score}/100`, good: result.similarity_score >= 60 },
                      { label: 'Matched Skills', value: result.matched_keywords?.length || 0, good: true },
                      { label: 'Missing Skills', value: result.missing_keywords?.length || 0, good: false },
                    ].map((stat, i) => (
                      <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                        <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: stat.good ? '#10b981' : '#f87171' }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Fit Summary (AI) or Score interpretation (fallback) */}
                <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.95rem' }}>
                    {hasAI ? '🤖 AI Role-Fit Summary' : '🎯 What This Means'}
                  </h3>
                  <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                    {hasAI ? ai.role_fit_summary : getScoreInterpretation(result.score)}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {getQuickActions(result).map((action, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--color-accent-primary)' }}>
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Wins (AI) */}
            {hasAI && ai.quick_wins?.length > 0 && (
              <div className="glass-card" style={{ padding: '20px', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>⚡ Quick Wins</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                  {ai.quick_wins.map((win, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{win}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Format Issues (AI) */}
            {hasAI && ai.ats_format_issues?.length > 0 && (
              <div className="glass-card" style={{ padding: '20px', marginBottom: 20, border: '1px solid rgba(251,191,36,0.25)' }}>
                <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24' }}>⚠️ ATS Formatting Warnings</h3>
                <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
                  {ai.ats_format_issues.map((issue, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <SectionScores sectionScores={result.section_scores} />
          </div>
        )}

        {/* ============================================================ */}
        {/* AI INSIGHTS                                                   */}
        {/* ============================================================ */}
        {activeSection === 'ai_insights' && hasAI && (
          <div className="animate-fade-in-up">

            {/* Gap Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
              {/* Strengths */}
              <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #10b981' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>💪 Strengths</h3>
                <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                  {ai.gap_analysis.strengths.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #f87171' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: '0.95rem', color: '#f87171' }}>⚠️ Gaps to Address</h3>
                <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                  {ai.gap_analysis.weaknesses.map((w, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #6366f1' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-accent-primary)' }}>🚀 Opportunities</h3>
                <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                  {ai.gap_analysis.opportunities.map((o, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Critical Skills */}
            {ai.missing_critical?.length > 0 && (
              <div className="glass-card" style={{ padding: '20px', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>🎯 Missing Critical Skills</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {ai.missing_critical.map((item, i) => (
                    <div key={i} style={{
                      padding: '12px 14px',
                      background: item.importance === 'high' ? 'rgba(248,113,113,0.06)' : 'rgba(251,191,36,0.06)',
                      border: `1px solid ${item.importance === 'high' ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.2)'}`,
                      borderRadius: 10,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.skill}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '2px 7px',
                          borderRadius: 20,
                          background: item.importance === 'high' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                          color: item.importance === 'high' ? '#f87171' : '#fbbf24',
                        }}>
                          {item.importance}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready-to-Use Resume Bullets */}
            {ai.resume_bullets?.length > 0 && (
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>📝 Ready-to-Use Resume Bullets</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Click any bullet to copy</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ai.resume_bullets.map((bullet, i) => (
                    <button
                      key={i}
                      onClick={() => copyBullet(bullet, i)}
                      title="Click to copy"
                      style={{
                        textAlign: 'left',
                        background: copiedBullet === i ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.05)',
                        border: `1px solid ${copiedBullet === i ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.15)'}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <span>• {bullet}</span>
                      <span style={{ fontSize: '0.7rem', flexShrink: 0, color: copiedBullet === i ? '#10b981' : 'var(--color-text-muted)', marginTop: 2 }}>
                        {copiedBullet === i ? '✅ Copied!' : '📋 Copy'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* KEYWORDS                                                      */}
        {/* ============================================================ */}
        {activeSection === 'keywords' && (
          <div className="animate-fade-in-up">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Matched */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#10b981' }}>
                  ✅ Matched Skills ({result.matched_keywords?.length || 0})
                </h3>
                {hasAI && ai.matched_skills?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ai.matched_skills.map((item, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#10b981' }}>{item.skill}</span>
                        {item.evidence && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4, fontStyle: 'italic' }}>
                            "{item.evidence}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(result.matched_keywords || []).map((kw, i) => (
                      <span key={i} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>{kw}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#f87171' }}>
                  ❌ Missing Skills ({result.missing_keywords?.length || 0})
                </h3>
                {hasAI && ai.missing_critical?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ai.missing_critical.map((item, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f87171' }}>{item.skill}</span>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: item.importance === 'high' ? '#f87171' : '#fbbf24' }}>{item.importance}</span>
                        </div>
                        {item.suggestion && (
                          <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{item.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(result.missing_keywords || []).map((kw, i) => (
                      <span key={i} style={{ padding: '6px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 20, fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTIONS                                                      */}
        {/* ============================================================ */}
        {activeSection === 'sections' && (
          <div className="animate-fade-in-up">
            <SectionScores sectionScores={result.section_scores} />
          </div>
        )}

        {/* ============================================================ */}
        {/* SUGGESTIONS                                                   */}
        {/* ============================================================ */}
        {activeSection === 'suggestions' && (
          <div className="animate-fade-in-up">
            <SuggestionsPanel suggestions={result.suggestions} />

            {/* AI Bullets in suggestions tab too */}
            {hasAI && ai.resume_bullets?.length > 0 && (
              <div className="glass-card" style={{ padding: '24px', marginTop: 20 }}>
                <h3 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.95rem' }}>✨ AI-Written Resume Bullets</h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  These bullets are tailored to this specific job description. Click to copy and paste directly into your resume.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ai.resume_bullets.map((bullet, i) => (
                    <button
                      key={i}
                      onClick={() => copyBullet(bullet, i + 100)}
                      style={{
                        textAlign: 'left',
                        background: copiedBullet === i + 100 ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.05)',
                        border: `1px solid ${copiedBullet === i + 100 ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.15)'}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <span>• {bullet}</span>
                      <span style={{ fontSize: '0.7rem', flexShrink: 0, color: copiedBullet === i + 100 ? '#10b981' : 'var(--color-text-muted)', marginTop: 2 }}>
                        {copiedBullet === i + 100 ? '✅ Copied!' : '📋 Copy'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ marginTop: 40, padding: '24px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.95rem' }}>Want a better score?</p>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
              {hasAI ? 'Add the AI-written bullets to your resume, then re-analyze.' : 'Update your resume with the insights above, then re-analyze.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleDownloadReport} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>📥 Save Report</button>
            <button onClick={handleNewAnalysis} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>🔄 Re-Analyze</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getScoreInterpretation(score) {
  if (score >= 80) return `Your resume is highly optimized for this position. ATS systems will likely surface it to recruiters. Focus on minor tweaks to reach 90+.`;
  if (score >= 60) return `Your resume has a decent match but could be stronger. Adding missing keywords and quantifying achievements can push you into the "high match" range.`;
  if (score >= 40) return `Your resume partially matches this job. Significant improvements to keyword coverage and section content are needed to compete effectively.`;
  return `Your resume has a low ATS match for this role. Consider a major revision: add relevant skills, rewrite experience using the job's language, and include missing keywords.`;
}

function getQuickActions(result) {
  const actions = [];
  const ai = result.ai_analysis;
  if (ai?.missing_critical?.length > 0) actions.push(`Add ${Math.min(ai.missing_critical.length, 5)} missing skills`);
  else if (result.missing_keywords?.length > 0) actions.push(`Add ${Math.min(result.missing_keywords.length, 5)} keywords`);
  if (result.section_scores?.skills < 60) actions.push('Expand Skills section');
  if (result.section_scores?.experience < 60) actions.push('Add metrics to bullets');
  if (result.keyword_match_pct < 70) actions.push('Improve keyword density');
  if (result.section_scores?.education < 40) actions.push('Add Education section');
  return actions.slice(0, 4);
}

function generateTextReport(result) {
  const ai = result.ai_analysis;
  const lines = [
    '='.repeat(60),
    'ATS RESUME ANALYSIS REPORT',
    '='.repeat(60),
    `Generated: ${new Date().toLocaleString()}`,
    `File: ${result.meta?.filename}`,
    `AI Model: ${result.meta?.ai_model || 'NLP only'}`,
    '',
    `OVERALL ATS SCORE: ${result.score}/100`,
    `Keyword Match: ${result.keyword_match_pct}%`,
    `TF-IDF Similarity: ${result.similarity_score}/100`,
    '',
    'SECTION SCORES:',
    `  Skills:     ${result.section_scores?.skills}/100`,
    `  Experience: ${result.section_scores?.experience}/100`,
    `  Tools:      ${result.section_scores?.tools}/100`,
    `  Education:  ${result.section_scores?.education}/100`,
  ];

  if (ai?.role_fit_summary) {
    lines.push('', 'ROLE-FIT SUMMARY (AI):', ai.role_fit_summary);
  }

  if (ai?.gap_analysis) {
    lines.push('', 'STRENGTHS:', ...(ai.gap_analysis.strengths.map(s => `  + ${s}`)));
    lines.push('', 'GAPS TO ADDRESS:', ...(ai.gap_analysis.weaknesses.map(w => `  - ${w}`)));
  }

  lines.push(
    '',
    `MATCHED SKILLS (${result.matched_keywords?.length}):`,
    (result.matched_keywords || []).join(', '),
    '',
    `MISSING SKILLS (${result.missing_keywords?.length}):`,
    (result.missing_keywords || []).join(', '),
  );

  if (ai?.resume_bullets?.length > 0) {
    lines.push('', 'AI-WRITTEN RESUME BULLETS (copy-paste ready):');
    ai.resume_bullets.forEach((b, i) => lines.push(`${i + 1}. ${b}`));
  }

  lines.push(
    '',
    'IMPROVEMENT TIPS:',
    ...(result.suggestions?.rule_based || []).map((s, i) => `${i + 1}. ${s}`),
    '',
    '='.repeat(60),
  );

  return lines.join('\n');
}
