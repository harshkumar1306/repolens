import { motion } from 'framer-motion';
import { Github, ArrowRight, Zap } from 'lucide-react';

// ─── HARDCODED — no env var. OAuth MUST go directly to the Render backend.
// Vercel proxy intercepts redirects; VITE_SOCKET_URL resolves to localhost in dev.
// This constant is the same in every environment. Do not change it.
const GITHUB_AUTH_URL = 'https://repolens-backend-awkk.onrender.com/auth/github';

const FEATURES = [
  'Architecture diagrams',
  'Full API reference',
  'Setup & deploy guides',
  'Database schema maps',
];

export default function Login() {
  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <div style={{
        position: 'absolute', top: '-160px', left: '-160px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(228,91,17,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-120px', right: '-120px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(248,171,11,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'relative', zIndex: 1,
          maxWidth: '400px', width: '100%', padding: '0 20px', textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '36px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #E45B11 0%, #F8AB0B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(228,91,17,0.35)',
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2.2"/>
              <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '24px',
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            RepoLens
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '30px',
          lineHeight: 1.2, letterSpacing: '-0.03em',
          color: 'var(--text-primary)', marginBottom: '12px',
        }}>
          Understand any codebase{' '}
          <span style={{
            background: 'linear-gradient(90deg, #E45B11, #F8AB0B)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            instantly.
          </span>
        </h1>

        <p style={{
          fontSize: '14px', lineHeight: 1.65, color: 'var(--text-secondary)',
          marginBottom: '28px',
        }}>
          Paste a GitHub URL and get full AI documentation — architecture diagrams,
          API references, and more — in under a minute.
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          justifyContent: 'center', marginBottom: '32px',
        }}>
          {FEATURES.map((f) => (
            <span key={f} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '20px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontFamily: '"DM Mono", monospace', fontSize: '11px',
              color: 'var(--text-secondary)',
            }}>
              <Zap size={10} style={{ color: 'var(--accent-amber)' }} />
              {f}
            </span>
          ))}
        </div>

        <motion.a
          href={GITHUB_AUTH_URL}
          whileHover={{ scale: 1.01, boxShadow: '0 0 28px rgba(228,91,17,0.22)' }}
          whileTap={{ scale: 0.99 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '14px 24px', borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hover)',
            color: 'var(--text-primary)', textDecoration: 'none',
            fontFamily: '"DM Mono", monospace', fontSize: '13px', fontWeight: 500,
          }}
        >
          <Github size={18} />
          Continue with GitHub
          <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </motion.a>

        <p style={{
          marginTop: '18px', fontFamily: '"DM Mono", monospace',
          fontSize: '11px', color: 'var(--text-muted)',
        }}>
          Read-only access. Your code is never stored.
        </p>
      </motion.div>
    </div>
  );
}
