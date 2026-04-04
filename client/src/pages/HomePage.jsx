/**
 * HomePage — Landing page with hero section, features, and CTA.
 */

import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🎯',
    title: 'ATS Score',
    description: 'Get an instant compatibility score based on keyword matching, TF-IDF similarity, and section analysis.',
  },
  {
    icon: '🔑',
    title: 'Keyword Analysis',
    description: 'See exactly which keywords from the job description your resume matches — and which ones are missing.',
  },
  {
    icon: '📊',
    title: 'Section Breakdown',
    description: 'Weighted scoring across Skills (40%), Experience (30%), Tools (20%), and Education (10%).',
  },
  {
    icon: '💡',
    title: 'Smart Suggestions',
    description: 'Actionable, specific tips to improve each section — with optional AI-powered GPT analysis.',
  },
  {
    icon: '📄',
    title: 'PDF & DOCX',
    description: 'Upload your resume in any format — PDF, DOCX, DOC, or plain text. We handle the extraction.',
  },
  {
    icon: '🧠',
    title: 'NLP Powered',
    description: 'Uses TF-IDF cosine similarity and natural language processing to analyze semantic relevance.',
  },
];

const STATS = [
  { label: 'Resumes Analyzed', value: '50K+' },
  { label: 'Keywords Tracked', value: '2,000+' },
  { label: 'Accuracy Rate', value: '94%' },
  { label: 'Average Score Increase', value: '+28pts' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '-200px', left: '-100px',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          bottom: '-200px', right: '-100px',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          animation: 'float 6s ease-in-out infinite 2s',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                ATS<span className="gradient-text">Checker</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s',
                }}
              >
                GitHub
              </a>
              <button
                id="cta-nav-btn"
                onClick={() => navigate('/upload')}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.875rem' }}
              >
                Try Free →
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '100px 24px 80px',
          textAlign: 'center',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: '0.8rem',
            color: 'var(--color-accent-primary)',
            marginBottom: 32,
            fontWeight: 600,
          }}>
            <span>✨</span>
            <span>NLP-Powered · TF-IDF · AI Suggestions</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            Beat the ATS.{' '}
            <span className="gradient-text">
              Land the Interview.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--color-text-secondary)',
            maxWidth: 600,
            margin: '0 auto 48px',
            lineHeight: 1.7,
          }}>
            Upload your resume, paste a job description, and get an instant ATS compatibility score
            with keyword analysis, section-wise breakdown, and actionable improvement tips.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="hero-start-btn"
              onClick={() => navigate('/upload')}
              className="btn-primary"
              style={{
                padding: '16px 40px',
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: 14,
                letterSpacing: '0.01em',
              }}
            >
              Start Analysis — Free →
            </button>
            <button
              onClick={() => {
                document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary"
              style={{ padding: '16px 32px', fontSize: '1rem', borderRadius: 14 }}
            >
              See How It Works
            </button>
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}>
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: '20px', textAlign: 'center' }}
              >
                <p style={{
                  margin: '0 0 4px',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {stat.value}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              Everything You Need to{' '}
              <span className="gradient-text">Optimize Your Resume</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
              Powered by advanced NLP algorithms built for real ATS systems
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: '28px',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: 16,
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '1rem' }}>
                  {feature.title}
                </h3>
                <p style={{
                  margin: 0,
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 100px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { step: 1, icon: '📤', title: 'Upload Resume', desc: 'Drag & drop your PDF or DOCX resume. We extract and preprocess the text automatically.' },
              { step: 2, icon: '📋', title: 'Paste Job Description', desc: 'Copy-paste the full job posting. The more detail, the better the analysis.' },
              { step: 3, icon: '🧠', title: 'NLP Analysis', desc: 'Our engine tokenizes both texts, runs TF-IDF similarity, and computes weighted section scores.' },
              { step: 4, icon: '📈', title: 'Get Your Report', desc: 'Receive your ATS score, keyword breakdown, section scores, and actionable improvement tips.' },
            ].map((step, i) => (
              <div
                key={i}
                className="glass-card"
                style={{ padding: '24px', display: 'flex', gap: 20, alignItems: 'flex-start' }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: 'white',
                }}>
                  {step.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{step.title}</h3>
                  </div>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '0 24px 120px',
          textAlign: 'center',
        }}>
          <div className="gradient-card" style={{ padding: '60px 40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>
              Ready to Optimize Your Resume?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 32, fontSize: '1rem' }}>
              Join thousands of job seekers who improved their ATS scores and landed more interviews.
            </p>
            <button
              id="cta-bottom-btn"
              onClick={() => navigate('/upload')}
              className="btn-primary"
              style={{ padding: '16px 48px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 14 }}
            >
              Analyze My Resume — It's Free ✨
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--color-border)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.82rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            <span>🎯</span>
            <strong style={{ color: 'var(--color-text-secondary)' }}>ATSChecker</strong>
          </div>
          <p style={{ margin: 0 }}>
            Built with React · Express · NLP ·{' '}
            <span style={{ color: 'var(--color-accent-primary)' }}>Open Source</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
