/**
 * KeywordList — displays matched and missing keywords as styled chips.
 * Supports filtering and showing/hiding overflow items.
 */

import { useState } from 'react';

const DEFAULT_SHOW = 30;

export default function KeywordList({ matched = [], missing = [] }) {
  const [activeTab, setActiveTab] = useState('matched');
  const [showAll, setShowAll] = useState(false);

  const keywords = activeTab === 'matched' ? matched : missing;
  const displayed = showAll ? keywords : keywords.slice(0, DEFAULT_SHOW);
  const hasMore = keywords.length > DEFAULT_SHOW;

  const matchPct = matched.length + missing.length > 0
    ? Math.round((matched.length / (matched.length + missing.length)) * 100)
    : 0;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1.05rem' }}>
          🔑 Keyword Analysis
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
          {matched.length} matched · {missing.length} missing ·{' '}
          <span style={{ color: matchPct >= 70 ? '#10b981' : matchPct >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
            {matchPct}% keyword coverage
          </span>
        </p>
      </div>

      {/* Tab navigation */}
      <div className="tab-nav" style={{ marginBottom: 16, width: 'fit-content' }}>
        <button
          className={`tab-btn ${activeTab === 'matched' ? 'active' : ''}`}
          onClick={() => { setActiveTab('matched'); setShowAll(false); }}
        >
          ✅ Matched ({matched.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'missing' ? 'active' : ''}`}
          onClick={() => { setActiveTab('missing'); setShowAll(false); }}
          style={activeTab === 'missing' ? {
            background: '#ef4444',
          } : {}}
        >
          ❌ Missing ({missing.length})
        </button>
      </div>

      {/* Keyword chips */}
      {keywords.length === 0 ? (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>
            {activeTab === 'matched' ? '🔍' : '🎉'}
          </span>
          {activeTab === 'matched'
            ? 'No keyword matches found. Add more relevant skills and terms from the job description.'
            : 'No missing keywords! Your resume covers all JD terms.'}
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {displayed.map((kw, i) => (
              <span
                key={`${kw}-${i}`}
                className={`keyword-chip ${activeTab === 'matched' ? 'keyword-chip-matched' : 'keyword-chip-missing'}`}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                {activeTab === 'matched' ? '✓' : '+'} {kw}
              </span>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                marginTop: 14,
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 8,
                color: 'var(--color-accent-primary)',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 500,
                display: 'block',
                width: '100%',
                transition: 'all 0.2s',
              }}
            >
              {showAll
                ? `▲ Show less`
                : `▼ Show ${keywords.length - DEFAULT_SHOW} more keywords`
              }
            </button>
          )}
        </>
      )}

      {/* Tip for missing keywords */}
      {activeTab === 'missing' && missing.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 10,
          fontSize: '0.8rem',
          color: '#fbbf24',
          lineHeight: 1.6,
        }}>
          💡 <strong>Tip:</strong> Naturally incorporate missing keywords into your experience bullets, skills section, or summary. Don't keyword-stuff — keep context authentic.
        </div>
      )}
    </div>
  );
}
