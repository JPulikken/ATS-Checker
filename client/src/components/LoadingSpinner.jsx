/**
 * LoadingSpinner — Full-page analysis loading state with progress stages.
 */

import { useEffect, useState } from 'react';

const STAGES = [
  { label: 'Extracting resume text...', duration: 1500, icon: '📄' },
  { label: 'Tokenizing & preprocessing...', duration: 1200, icon: '⚙️' },
  { label: 'Matching keywords...', duration: 1000, icon: '🔍' },
  { label: 'Computing section scores...', duration: 1200, icon: '📊' },
  { label: 'Running TF-IDF analysis...', duration: 1000, icon: '🧠' },
  { label: 'Generating suggestions...', duration: 800, icon: '💡' },
  { label: 'Finalizing report...', duration: 500, icon: '✅' },
];

export default function LoadingSpinner({ uploadProgress = 0 }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    let stageIndex = 0;
    const advance = () => {
      if (stageIndex < STAGES.length - 1) {
        stageIndex++;
        setCurrentStage(stageIndex);
        setTimeout(advance, STAGES[stageIndex].duration);
      }
    };
    const timer = setTimeout(advance, STAGES[0].duration);
    return () => clearTimeout(timer);
  }, []);

  // Animated dots
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const overallProgress = Math.min(
    uploadProgress > 0 ? uploadProgress * 0.3 : 0,
    30
  ) + (currentStage / (STAGES.length - 1)) * 70;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '32px',
      padding: '40px 24px',
    }}>
      {/* Animated spinner */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
          {/* Spinning arc */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="url(#spinner-gradient)"
            strokeWidth="6"
            strokeDasharray="80 184"
            strokeLinecap="round"
            style={{ transformOrigin: 'center', animation: 'spin-slow 1.2s linear infinite' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
        }}>
          {STAGES[currentStage]?.icon}
        </div>
      </div>

      {/* Stage info */}
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700 }}>
          Analyzing Your Resume{dots}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
          {STAGES[currentStage]?.label}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}>
          <span>Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="progress-bar-track" style={{ height: 10 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${overallProgress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>

      {/* Stage checklist */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: '100%',
        maxWidth: 380,
      }}>
        {STAGES.slice(0, currentStage + 1).map((stage, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.8rem',
            color: i < currentStage ? '#10b981' : 'var(--color-text-secondary)',
            animation: i === currentStage ? 'fade-in-up 0.3s ease-out' : 'none',
          }}>
            <span style={{ fontSize: '0.75rem' }}>
              {i < currentStage ? '✓' : '⟳'}
            </span>
            {stage.label}
          </div>
        ))}
      </div>
    </div>
  );
}
