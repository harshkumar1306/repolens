import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowRight, Loader2, Search } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const EXAMPLES = [
  { name: 'facebook/react',    url: 'https://github.com/facebook/react',    note: '~200k ★' },
  { name: 'vercel/next.js',    url: 'https://github.com/vercel/next.js',    note: '~120k ★' },
  { name: 'expressjs/express', url: 'https://github.com/expressjs/express', note: '~65k ★'  },
  { name: 'prisma/prisma',     url: 'https://github.com/prisma/prisma',     note: '~40k ★'  },
];

export default function CommandPalette({ open, onClose }) {
  const [url,     setUrl]     = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open)  setTimeout(() => inputRef.current?.focus(), 60);
    else       setUrl('');
  }, [open]);

  const submit = async (repoUrl) => {
    const target = (repoUrl || url).trim();
    if (!target) return;
    setLoading(true);
    try {
      const res = await api.post('/api/jobs', { repoUrl: target });
      onClose();
      navigate(`/results/${res.data.jobId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start analysis');
    } finally {
      setLoading(false);
    }
  };

  const isValid = url.trim().startsWith('https://github.com/');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(22,22,20,0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Panel — centred horizontally, sits at 28% from top */}
          <motion.div
            key="palette-panel"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{   opacity: 0, scale: 0.96, y: -10  }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: '28%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 51,
              width: '100%',
              maxWidth: 520,
              padding: '0 16px',
            }}
          >
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hover)',
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 32px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(228,91,17,0.08)',
            }}>
              {/* Input */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
              }}>
                <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="https://github.com/owner/repo"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: '"DM Mono",monospace', fontSize: 13,
                    color: 'var(--text-primary)', caretColor: 'var(--accent)',
                  }}
                />
                <button
                  onClick={() => submit()}
                  disabled={loading || !isValid}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    cursor: isValid ? 'pointer' : 'default',
                    background: isValid ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: isValid ? 'white' : 'var(--text-muted)',
                    fontFamily: '"DM Mono",monospace', fontSize: 12, fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  {loading
                    ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    : <ArrowRight size={12} />}
                  {loading ? 'Starting…' : 'Analyze'}
                </button>
              </div>

              {/* Quick start list */}
              <div style={{ paddingBottom: 6 }}>
                <p style={{
                  padding: '10px 16px 6px',
                  fontFamily: '"DM Mono",monospace', fontSize: 10,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>
                  Quick start
                </p>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.url}
                    onClick={() => submit(ex.url)}
                    className="palette-row"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 16px', border: 'none', background: 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Github size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 13, color: 'var(--text-primary)' }}>
                        {ex.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                      {ex.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
