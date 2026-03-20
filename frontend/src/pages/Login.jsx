import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';

const GITHUB_AUTH_URL = 'https://repolens-backend-awkk.onrender.com/auth/github';

/* ── Decorative SVG — abstract lens/search motif ─────────────────── */
function DecorativeVisual() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <svg
        viewBox="0 0 480 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '82%', maxWidth: 400, opacity: 0.9 }}
      >
        {/* Outer faint ring */}
        <circle cx="220" cy="220" r="200" stroke="#585B4A" strokeWidth="1" strokeDasharray="4 8" />

        {/* Mid ring */}
        <circle cx="220" cy="220" r="148" stroke="#585B4A" strokeWidth="1" opacity="0.6" />

        {/* Main lens circle — ember stroke */}
        <circle cx="220" cy="220" r="96" stroke="url(#lensGrad)" strokeWidth="2.5" />

        {/* Inner filled accent dot */}
        <circle cx="220" cy="220" r="18" fill="url(#dotGrad)" opacity="0.9" />

        {/* Search handle */}
        <line
          x1="293" y1="293" x2="352" y2="352"
          stroke="url(#handleGrad)" strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Cross-hair lines through lens */}
        <line x1="220" y1="130" x2="220" y2="155" stroke="#585B4A" strokeWidth="1" opacity="0.7" />
        <line x1="220" y1="285" x2="220" y2="310" stroke="#585B4A" strokeWidth="1" opacity="0.7" />
        <line x1="130" y1="220" x2="155" y2="220" stroke="#585B4A" strokeWidth="1" opacity="0.7" />
        <line x1="285" y1="220" x2="310" y2="220" stroke="#585B4A" strokeWidth="1" opacity="0.7" />

        {/* Orbit dots */}
        <circle cx="220" cy="72"  r="4" fill="#E45B11" opacity="0.7" />
        <circle cx="368" cy="220" r="3" fill="#F8AB0B" opacity="0.55" />
        <circle cx="220" cy="368" r="4" fill="#F4860D" opacity="0.45" />
        <circle cx="72"  cy="220" r="3" fill="#FBC255" opacity="0.4" />

        {/* Diagonal accent tick marks */}
        <line x1="285" y1="155" x2="297" y2="143" stroke="#E45B11" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
        <line x1="155" y1="285" x2="143" y2="297" stroke="#F8AB0B" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />

        {/* Subtle arc segment — top-right quadrant */}
        <path
          d="M 291 149 A 148 148 0 0 1 368 220"
          stroke="url(#arcGrad)" strokeWidth="2" fill="none" strokeLinecap="round"
        />

        <defs>
          <linearGradient id="lensGrad" x1="124" y1="124" x2="316" y2="316" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E45B11" />
            <stop offset="100%" stopColor="#F8AB0B" />
          </linearGradient>
          <linearGradient id="dotGrad" x1="202" y1="202" x2="238" y2="238" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E45B11" />
            <stop offset="100%" stopColor="#FBC255" />
          </linearGradient>
          <linearGradient id="handleGrad" x1="293" y1="293" x2="352" y2="352" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E45B11" />
            <stop offset="100%" stopColor="#585B4A" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="arcGrad" x1="291" y1="149" x2="368" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#F8AB0B" />
            <stop offset="100%" stopColor="#F8AB0B" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient glow behind the graphic */}
      <div style={{
        position: 'absolute',
        width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(228,91,17,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ── Login page ──────────────────────────────────────────────────── */
export default function Login() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)', overflow: 'hidden',
    }}>

      {/* ── Left: decorative panel ──────────────────────────────── */}
      <div
        className="hidden md:flex"
        style={{
          flex: 1, position: 'relative',
          borderRight: '1px solid var(--border)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <DecorativeVisual />

        {/* Wordmark pinned bottom-left */}
        <div style={{
          position: 'absolute', bottom: 32, left: 36,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{
            fontFamily: '"DM Mono",monospace', fontSize: 10,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            AI Documentation Generator
          </span>
        </div>
      </div>

      {/* ── Right: auth form ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px', position: 'relative',
        }}
      >
        {/* Subtle glow */}
        <div style={{
          position: 'absolute', top: '35%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(228,91,17,0.1) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 300, position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: 'linear-gradient(135deg,#E45B11 0%,#F8AB0B 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 28px rgba(228,91,17,0.3)',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2.2"/>
                <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              RepoLens
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Syne,sans-serif', fontWeight: 800,
            fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.025em',
            color: 'var(--text-primary)', marginBottom: 10,
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
            fontSize: 14, lineHeight: 1.65,
            color: 'var(--text-secondary)', marginBottom: 32,
          }}>
            Paste a GitHub URL and get complete AI-generated documentation in under a minute.
          </p>

          {/* GitHub button */}
          <motion.a
            href={GITHUB_AUTH_URL}
            whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(228,91,17,0.2)' }}
            whileTap={{ scale: 0.985 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 18px', borderRadius: 11, width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hover)',
              color: 'var(--text-primary)', textDecoration: 'none',
              fontFamily: '"DM Mono",monospace', fontSize: 13, fontWeight: 500,
            }}
          >
            <Github size={17} />
            Continue with GitHub
            <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </motion.a>

          <p style={{
            marginTop: 16, fontFamily: '"DM Mono",monospace',
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
          }}>
            Read-only access · Your code is never stored
          </p>
        </div>
      </motion.div>
    </div>
  );
}