import { useContext } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, FileText, Cpu, BookOpen } from 'lucide-react';
import { AppContext } from '../App';

const CARDS = [
  { icon: GitBranch, label: 'Architecture', desc: 'Auto-generated Mermaid flowcharts' },
  { icon: FileText,  label: '8 Doc Sections', desc: 'Overview, API, setup, deployment…' },
  { icon: Cpu,       label: 'Claude AI',  desc: 'Powered by claude-haiku-4-5'      },
  { icon: BookOpen,  label: 'GitBook-style', desc: 'Beautiful premium reading UX'   },
];

export default function Dashboard() {
  const { setPaletteOpen, user } = useContext(AppContext);

  return (
    <div
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(228,91,17,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ maxWidth: '540px', width: '100%', textAlign: 'center', position: 'relative' }}
      >
        {/* Greeting */}
        <p style={{
          fontFamily: '"DM Mono", monospace', fontSize: '12px',
          color: 'var(--text-muted)', marginBottom: '20px',
          letterSpacing: '0.04em',
        }}>
          — hey, {user?.username}
        </p>

        {/* Hero text */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '40px',
          lineHeight: 1.15, letterSpacing: '-0.03em',
          color: 'var(--text-primary)', marginBottom: '14px',
        }}>
          Understand any{' '}
          <span style={{
            background: 'linear-gradient(90deg, #E45B11 20%, #F8AB0B 80%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            codebase
          </span>{' '}
          instantly.
        </h1>

        <p style={{
          fontSize: '15px', lineHeight: 1.65,
          color: 'var(--text-secondary)', marginBottom: '32px',
        }}>
          Paste a GitHub URL and get complete AI-generated documentation — architecture diagrams, API references, and developer guides.
        </p>

        {/* CTA */}
        <motion.button
          onClick={() => setPaletteOpen(true)}
          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(228,91,17,0.45)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '13px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: 'var(--accent)',
            color: 'white',
            fontFamily: '"DM Mono", monospace', fontSize: '13px', fontWeight: 500,
            boxShadow: '0 0 24px rgba(228,91,17,0.3)',
          }}
        >
          Analyze a repository
          <kbd style={{
            padding: '3px 7px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.15)',
            fontSize: '11px', letterSpacing: '0.02em',
          }}>
            ⌘K
          </kbd>
        </motion.button>

        {/* Feature grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
          marginTop: '44px',
        }}>
          {CARDS.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              style={{
                padding: '16px', borderRadius: '12px', textAlign: 'left',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
              }}
            >
              <Icon size={15} style={{ color: 'var(--accent-flame)', marginBottom: '8px' }} />
              <p style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px',
                color: 'var(--text-primary)', marginBottom: '4px',
              }}>
                {label}
              </p>
              <p style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: '12px',
                color: 'var(--text-muted)', lineHeight: 1.5,
              }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}