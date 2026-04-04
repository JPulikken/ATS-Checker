/**
 * ScoreCard — Animated circular ATS score display.
 * Shows overall score, grade, and status label.
 */

import { useEffect, useRef, useState } from 'react';
import { getScoreColor, getGrade } from '../utils/helpers';

const RADIUS = 80;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;

export default function ScoreCard({ score, animate = true }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef(null);

  const { color, label } = getScoreColor(score);
  const grade = getGrade(score);

  // Animate score counter and ring
  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      setProgress(score / 100);
      return;
    }

    let start = null;
    const duration = 1500;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easedT = 1 - Math.pow(1 - t, 3);

      setDisplayScore(Math.round(easedT * score));
      setProgress(easedT * (score / 100));

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [score, animate]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Gradient ID for SVG
  const gradientId = `score-gradient-${score}`;

  return (
    <div className="animate-fade-in-up" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '32px',
    }}>
      {/* Circular Ring */}
      <div className="score-ring-container">
        <svg width={SIZE} height={SIZE} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ring */}
          <circle
            className="score-ring-bg"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE_WIDTH}
          />

          {/* Progress ring */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
              transition: 'stroke-dashoffset 0.05s linear',
            }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <span style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            lineHeight: 1,
            color: color,
            textShadow: `0 0 20px ${color}40`,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {displayScore}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
          }}>
            / 100
          </span>
        </div>
      </div>

      {/* Score label and grade */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: color,
          }}>
            {label}
          </span>
          <span style={{
            background: `${color}20`,
            border: `1px solid ${color}40`,
            color: color,
            borderRadius: 8,
            padding: '2px 10px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}>
            {grade}
          </span>
        </div>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.8rem',
          marginTop: 6,
          margin: '6px 0 0',
        }}>
          ATS Compatibility Score
        </p>
      </div>

      {/* Score interpretation bar */}
      <div style={{
        width: '100%',
        maxWidth: 280,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          marginBottom: 6,
        }}>
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
        <div style={{
          height: 6,
          borderRadius: 3,
          background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 33%, #6366f1 66%, #10b981 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${score}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'white',
            border: `3px solid ${color}`,
            boxShadow: `0 0 8px ${color}60`,
            transition: 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      </div>
    </div>
  );
}
