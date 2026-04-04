/**
 * SectionScores — Animated progress bars for section-wise ATS breakdown.
 * Shows skills, experience, tools, and education with weighted scores.
 */

import { useEffect, useRef, useState } from 'react';
import { getScoreColor, getScoreGradient, SECTION_CONFIG } from '../utils/helpers';

function SectionBar({ sectionKey, score, delay = 0 }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const { color } = getScoreColor(score);
  const gradient = getScoreGradient(score);
  const config = SECTION_CONFIG[sectionKey] || { label: sectionKey, icon: '📊', weight: 0, description: '' };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(score);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Label row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 34,
            height: 34,
            background: `${color}18`,
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            border: `1px solid ${color}30`,
            flexShrink: 0,
          }}>
            {config.icon}
          </span>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              {config.label}
            </p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {config.description}
            </p>
          </div>
        </div>

        {/* Score + weight badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            background: 'rgba(255,255,255,0.04)',
            padding: '2px 8px',
            borderRadius: 6,
            border: '1px solid var(--color-border)',
          }}>
            ×{config.weight}%
          </span>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: color,
            minWidth: 40,
            textAlign: 'right',
          }}>
            {score}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${animatedWidth}%`,
            background: gradient,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>

      {/* Score context */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4,
        fontSize: '0.7rem',
        color: 'var(--color-text-muted)',
      }}>
        <span>0</span>
        <span style={{ color: color, fontWeight: 500 }}>
          {score >= 80 ? '🟢 Strong' : score >= 60 ? '🟡 Good' : score >= 40 ? '🟠 Needs Work' : '🔴 Improve'}
        </span>
        <span>100</span>
      </div>
    </div>
  );
}

export default function SectionScores({ sectionScores = {} }) {
  const sections = ['skills', 'experience', 'tools', 'education'];

  // Compute weighted total
  const weights = { skills: 0.4, experience: 0.3, tools: 0.2, education: 0.1 };
  const weightedTotal = sections.reduce((sum, key) => {
    return sum + (sectionScores[key] || 0) * (weights[key] || 0);
  }, 0);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1.05rem' }}>
              📊 Section-wise Breakdown
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
              Weighted scores by resume section importance
            </p>
          </div>
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 10,
            padding: '6px 14px',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Weighted Avg</p>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent-primary)' }}>
              {Math.round(weightedTotal)}
            </p>
          </div>
        </div>
      </div>

      {sections.map((key, i) => (
        <SectionBar
          key={key}
          sectionKey={key}
          score={sectionScores[key] || 0}
          delay={i * 150}
        />
      ))}

      {/* Weight legend */}
      <div style={{
        marginTop: 8,
        padding: '12px 14px',
        background: 'rgba(99, 102, 241, 0.05)',
        borderRadius: 10,
        border: '1px solid rgba(99, 102, 241, 0.1)',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        lineHeight: 1.8,
      }}>
        <strong style={{ color: 'var(--color-text-secondary)' }}>Score Weights:</strong>{' '}
        Skills (40%) + Experience (30%) + Tools (20%) + Education (10%) = Overall ATS Score contribution
      </div>
    </div>
  );
}
