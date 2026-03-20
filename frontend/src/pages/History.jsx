import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package } from 'lucide-react';
import HistoryCard from '../components/HistoryCard';
import api from '../lib/api';

export default function History() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    api
      .get('/api/jobs')
      .then((res) => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.repoUrl?.toLowerCase().includes(q) ||
      j.repoName?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px', flexShrink: 0,
          background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px',
            color: 'var(--text-primary)',
          }}>
            Analysis History
          </h2>
          <p style={{
            fontFamily: '"DM Mono", monospace', fontSize: '11px',
            color: 'var(--text-muted)', marginTop: '2px',
          }}>
            {jobs.length} {jobs.length === 1 ? 'repository' : 'repositories'} analyzed
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 12px', borderRadius: '9px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          width: '220px',
        }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repos…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: '"DM Mono", monospace', fontSize: '12px',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#E45B11', '#F4860D', '#F8AB0B'].map((c, i) => (
                <motion.span
                  key={i}
                  style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: c }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.7, delay: i * 0.14, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '220px', textAlign: 'center',
          }}>
            <Package size={36} style={{ color: 'var(--text-muted)', marginBottom: '14px' }} />
            <p style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px',
              color: 'var(--text-secondary)', marginBottom: '6px',
            }}>
              {search ? 'No matching repos' : 'No analyses yet'}
            </p>
            <p style={{
              fontFamily: '"DM Mono", monospace', fontSize: '12px',
              color: 'var(--text-muted)',
            }}>
              {search ? 'Try a different search' : 'Press ⌘K to analyze your first repo'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '680px' }}>
            {filtered.map((job, i) => (
              <HistoryCard key={job.id} job={job} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}