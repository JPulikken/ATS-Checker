/**
 * UploadPage — Resume upload + job description textarea.
 * Manages form state and submits to the backend for analysis.
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeResume } from '../utils/api';
import { formatFileSize } from '../utils/helpers';

const JD_PLACEHOLDER = `Paste the full job description here...

Example:
We are looking for a Senior Full-Stack Engineer to join our team.

Requirements:
• 5+ years of experience with React and Node.js
• Strong proficiency in TypeScript and REST API design
• Experience with AWS (EC2, S3, Lambda) and Docker
• Familiarity with PostgreSQL and Redis
• Strong understanding of CI/CD pipelines (GitHub Actions)
• Experience with agile/scrum methodologies

Nice to have:
• GraphQL experience
• Kubernetes knowledge
• Machine learning background`;

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const jdRef = useRef(null);

  const jdLength = jobDescription.trim().length;
  const jdWordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
  const isValid = file && jdLength >= 50;

  const handleFileChange = useCallback((newFile) => {
    setFile(newFile);
    setError('');
  }, []);

  const handleAnalyze = async () => {
    if (!isValid || isAnalyzing) return;

    setError('');
    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      const result = await analyzeResume(file, jobDescription, setUploadProgress);
      if (result.success) {
        // Store result in sessionStorage for results page
        sessionStorage.setItem('ats_result', JSON.stringify(result.data));
        navigate('/results');
      } else {
        setError(result.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Make sure the backend is running.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  if (isAnalyzing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <nav className="navbar">
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: '1.4rem' }}>🎯</span>
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                ATS<span className="gradient-text">Checker</span>
              </span>
            </button>
          </div>
        </nav>
        <LoadingSpinner uploadProgress={uploadProgress} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }} className="bg-grid-pattern">
      {/* Navbar */}
      <nav className="navbar">
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🎯</span>
            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              ATS<span className="gradient-text">Checker</span>
            </span>
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Step 1 of 2 — Upload & Describe
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}>
            Upload Your Resume &{' '}
            <span className="gradient-text">Job Description</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
            We'll analyze keyword matches, section scores, and generate improvement tips.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            marginBottom: 24,
            padding: '14px 18px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 12,
            color: '#fca5a5',
            fontSize: '0.875rem',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}>
          {/* Resume Upload */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1.05rem' }}>
                1️⃣ Upload Resume
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                PDF, DOCX, DOC, or TXT · Max 5MB
              </p>
            </div>

            <FileUploader file={file} onFileChange={handleFileChange} />

            {file && (
              <div style={{
                marginTop: 16,
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.8rem',
                color: '#6ee7b7',
              }}>
                <span>✓</span>
                <span>
                  <strong>{file.name}</strong> ready for analysis
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: 6 }}>
                    ({formatFileSize(file.size)})
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1.05rem' }}>
                    2️⃣ Job Description
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    Paste the full job posting for best results
                  </p>
                </div>
                {jdWordCount > 0 && (
                  <span className="stat-badge">
                    {jdWordCount} words
                  </span>
                )}
              </div>
            </div>

            <textarea
              ref={jdRef}
              id="job-description-input"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setError('');
              }}
              placeholder={JD_PLACEHOLDER}
              rows={16}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${jdLength > 0 && jdLength < 50 ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '14px',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = jdLength < 50 && jdLength > 0
                  ? 'rgba(239,68,68,0.4)'
                  : 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* JD validation */}
            {jdLength > 0 && jdLength < 50 && (
              <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 6 }}>
                ⚠️ Please paste a more complete job description (minimum 50 characters)
              </p>
            )}

            {jdLength >= 50 && (
              <p style={{ color: '#6ee7b7', fontSize: '0.75rem', marginTop: 6 }}>
                ✓ Job description looks good!
              </p>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={!isValid}
            className="btn-primary"
            style={{
              padding: '16px 64px',
              fontSize: '1.05rem',
              fontWeight: 700,
              borderRadius: 14,
              minWidth: 280,
            }}
          >
            {!file
              ? '📤 Upload Resume First'
              : jdLength < 50
                ? '📋 Add Job Description'
                : '🚀 Analyze Resume Now →'
            }
          </button>

          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.78rem',
            marginTop: 12,
          }}>
            Your resume is never stored. Files are deleted immediately after analysis. 🔒
          </p>
        </div>

        {/* Tips */}
        <div style={{
          marginTop: 40,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {[
            { icon: '📄', tip: 'Use a text-based PDF (not scanned image)' },
            { icon: '🎯', tip: 'Paste the complete job description for best accuracy' },
            { icon: '⚡', tip: 'Analysis takes under 10 seconds' },
            { icon: '🔒', tip: 'Files deleted after analysis — 100% private' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              {item.tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
