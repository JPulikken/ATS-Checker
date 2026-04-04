/**
 * SuggestionsPanel — Displays rule-based and AI improvement suggestions.
 * Shows suggestions with priority icons, expandable content, and copy actions.
 */

import { useState } from 'react';

export default function SuggestionsPanel({ suggestions = {} }) {
  const [expanded, setExpanded] = useState(true);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const ruleBased = suggestions.rule_based || [];
  const ai = suggestions.ai || [];
  const hasAI = ai.length > 0;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  const SuggestionItem = ({ text, index, isAI = false }) => (
    <div
      className={`suggestion-item ${isAI ? 'suggestion-item-ai' : ''}`}
      style={{ marginBottom: 8, position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: 'var(--color-text-primary)',
          lineHeight: 1.65,
          flex: 1,
        }}>
          {text}
        </p>
        <button
          onClick={() => handleCopy(text, `${isAI ? 'ai' : 'rb'}-${index}`)}
          title="Copy suggestion"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 6,
            flexShrink: 0,
            fontSize: '0.75rem',
            color: copiedIndex === `${isAI ? 'ai' : 'rb'}-${index}`
              ? '#10b981'
              : 'var(--color-text-muted)',
            transition: 'color 0.2s',
          }}
        >
          {copiedIndex === `${isAI ? 'ai' : 'rb'}-${index}` ? '✓ Copied' : '📋'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '1.05rem' }}>
        💡 Improvement Suggestions
      </h3>

      {/* Rule-based suggestions */}
      <div style={{ marginBottom: hasAI ? 24 : 0 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 0 12px',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--color-accent-primary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Smart Tips
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            {ruleBased.length} suggestions
          </span>
          <span style={{
            marginLeft: 'auto',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>
            ▾
          </span>
        </button>

        {expanded && (
          <div>
            {ruleBased.length > 0 ? (
              ruleBased.map((suggestion, i) => (
                <SuggestionItem
                  key={i}
                  text={suggestion}
                  index={i}
                  isAI={false}
                />
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No suggestions available.
              </p>
            )}
          </div>
        )}
      </div>

      {/* AI suggestions */}
      {hasAI && (
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 20,
        }}>
          <button
            onClick={() => setAiExpanded(!aiExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 12px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 6,
              padding: '2px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--color-accent-tertiary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              ✨ AI-Powered
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              {ai.length} GPT suggestions
            </span>
            <span style={{
              marginLeft: 'auto',
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
              transform: aiExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}>
              ▾
            </span>
          </button>

          {aiExpanded && (
            <div>
              {ai.map((suggestion, i) => (
                <SuggestionItem
                  key={i}
                  text={suggestion}
                  index={i}
                  isAI={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI disabled notice */}
      {!hasAI && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px dashed rgba(99, 102, 241, 0.2)',
          borderRadius: 10,
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
        }}>
          ✨ <strong style={{ color: 'var(--color-text-secondary)' }}>Want AI-powered tips?</strong>{' '}
          Set <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 4 }}>OPENAI_API_KEY</code> in your server <code>.env</code> to enable personalized GPT suggestions.
        </div>
      )}
    </div>
  );
}
