import { motion } from 'framer-motion';
import { Github, ArrowRight, Zap, GitBranch, FileText, Cpu, BookOpen } from 'lucide-react';

const GITHUB_AUTH_URL = 'https://repolens-backend-awkk.onrender.com/auth/github';

const FEATURES = [
  { icon: GitBranch, label: 'Architecture diagrams',  desc: 'Auto-generated Mermaid flowcharts of your system' },
  { icon: FileText,  label: 'Full API reference',      desc: 'Every endpoint documented automatically'          },
  { icon: Cpu,       label: 'Powered by Claude AI',    desc: 'claude-haiku-4-5 reads and understands your code' },
  { icon: BookOpen,  label: '8 doc sections',          desc: 'Overview, spec, DB schema, setup, deployment…'    },
];

export default function Login() {
  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex',
        background: 'var(--bg)', overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Glow blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(228,91,17,0.13) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(248,171,11,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Left column: branding + features ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 64px',
          position: 'relative', zIndex: 1,
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#E45B11 0%,#F8AB0B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 36px rgba(228,91,17,0.35)',
          }}>
            <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2.2"/>
              <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            RepoLens
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 3.5vw, 52px)',
          lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text-primary)',
          marginBottom: 18, maxWidth: 520,
        }}>
          Understand any codebase{' '}
          <span style={{
            background: 'linear-gradient(90deg,#E45B11,#F8AB0B)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            instantly.
          </span>
        </h1>

        <p style={{
          fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)',
          maxWidth: 440, marginBottom: 48,
        }}>
          Paste a GitHub URL and get complete AI-generated documentation in under a minute. Architecture diagrams, API references, setup guides — all automated.
        </p>

        {/* Feature list */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 520 }}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{
              padding: '16px 18px', borderRadius: 12,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <Icon size={15} style={{ color: 'var(--accent-flame)', marginBottom: 8 }} />
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="hidden md:block" style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', margin: '40px 0' }} />

      {/* ── Right column: auth form ── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
        style={{
          width: '100%', maxWidth: 480,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-3 mb-10">
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg,#E45B11,#F8AB0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(228,91,17,0.3)',
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2.2"/>
              <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
            RepoLens
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: 340 }}>
          <h2 style={{
            fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24,
            color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em',
          }}>
            Get started
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            Connect your GitHub account to start generating documentation.
          </p>

          {/* Feature pills — mobile only */}
          <div className="md:hidden flex flex-wrap gap-2 mb-8">
            {['Architecture', 'API docs', 'Setup guide', 'DB schema'].map((f) => (
              <span key={f} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 20,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--text-secondary)',
              }}>
                <Zap size={9} style={{ color: '#F8AB0B' }} />
                {f}
              </span>
            ))}
          </div>

          {/* GitHub button */}
          <motion.a
            href={GITHUB_AUTH_URL}
            whileHover={{ scale: 1.015, boxShadow: '0 0 32px rgba(228,91,17,0.2)' }}
            whileTap={{ scale: 0.985 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px', borderRadius: 12, width: '100%',
              background: 'var(--bg-surface)', border: '1px solid var(--border-hover)',
              color: 'var(--text-primary)', textDecoration: 'none',
              fontFamily: '"DM Mono",monospace', fontSize: 13, fontWeight: 500,
            }}
          >
            <Github size={18} />
            Continue with GitHub
            <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </motion.a>

          <p style={{
            marginTop: 18, fontFamily: '"DM Mono",monospace',
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
          }}>
            Read-only access · Your code is never stored
          </p>
        </div>
      </motion.div>
    </div>
  );
}
