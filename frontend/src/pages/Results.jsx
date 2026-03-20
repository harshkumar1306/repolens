import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Github } from 'lucide-react';
import api from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import ProgressTracker from '../components/ProgressTracker';
import DocViewer from '../components/DocViewer';

const DOC_ORDER = [
  'OVERVIEW', 'SPEC', 'ARCHITECTURE', 'TECHSTACK',
  'DATABASE', 'API', 'SETUP', 'DEPLOYMENT',
];

/* Animated waiting dots */
function WaitingDots({ message }) {
  return (
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        {['#E45B11', '#F4860D', '#F8AB0B'].map((color, i) => (
          <motion.span
            key={i}
            style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: color }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.75, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {message && (
        <p style={{
          fontFamily: '"DM Mono", monospace', fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docs,         setDocs]         = useState({});
  const [status,       setStatus]       = useState('loading');
  const [progressMsg,  setProgressMsg]  = useState('Initializing…');
  const [rateLimitMsg, setRateLimitMsg] = useState(null);
  const [activeTab,    setActiveTab]    = useState(null);
  const [repoDisplay,  setRepoDisplay]  = useState('');

  /* Load existing job data */
  useEffect(() => {
    api
      .get(`/api/jobs/${id}`)
      .then((res) => {
        const job = res.data;
        setRepoDisplay(
          job.repoName || job.repoUrl?.replace('https://github.com/', '') || 'Repository'
        );

        if (job.documents?.length > 0) {
          const map = {};
          job.documents.forEach((d) => { map[d.type] = d.content; });
          setDocs(map);
          const first = DOC_ORDER.find((t) => map[t]);
          if (first) setActiveTab(first);
        }

        if      (job.status === 'DONE')   setStatus('done');
        else if (job.status === 'FAILED') setStatus('failed');
        else                              setStatus('processing');
      })
      .catch(() => navigate('/'));
  }, [id]);

  /* Socket handlers — use functional state updates to avoid stale closures */
  const handlers = {
    'job:status': useCallback(({ message }) => {
      setProgressMsg(message);
      setStatus('processing');
    }, []),

    'job:rateLimit': useCallback(({ message }) => {
      setRateLimitMsg(message);
    }, []),

    'job:docComplete': useCallback(({ type, content }) => {
      setRateLimitMsg(null);
      setDocs((prev) => ({ ...prev, [type]: content }));
      setActiveTab((prev) => prev || type);
    }, []),

    'job:done': useCallback(() => {
      setStatus('done');
    }, []),

    'job:cached': useCallback(({ jobId }) => {
      api.get(`/api/jobs/${jobId}`).then((res) => {
        const map = {};
        res.data.documents.forEach((d) => { map[d.type] = d.content; });
        setDocs(map);
        const first = DOC_ORDER.find((t) => map[t]);
        if (first) setActiveTab(first);
        setStatus('done');
      });
    }, []),

    'job:error': useCallback(({ message }) => {
      setStatus('failed');
      setProgressMsg(message);
    }, []),
  };

  useSocket(status === 'processing' ? id : null, handlers);

  const isProcessing  = status === 'processing' || status === 'loading';
  const isDone        = status === 'done';
  const completedTypes = DOC_ORDER.filter((t) => docs[t]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 16px', flexShrink: 0, minHeight: '44px',
          background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '6px', borderRadius: '7px', border: 'none',
            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={14} />
        </button>

        <Github size={13} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
          github.com/
        </span>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px',
          color: 'var(--text-primary)',
        }}>
          {repoDisplay}
        </span>

        {/* Status indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <motion.span
            style={{
              display: 'block', width: '7px', height: '7px', borderRadius: '50%',
              background: isDone ? '#F8AB0B' : isProcessing ? '#E45B11' : '#585B4A',
            }}
            animate={isProcessing ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            {isDone ? 'Complete' : isProcessing ? 'Generating…' : status}
          </span>
        </div>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Progress panel */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{   opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              style={{ flexShrink: 0 }}
            >
              <ProgressTracker
                completedTypes={completedTypes}
                currentMessage={progressMsg}
                rateLimitMsg={rateLimitMsg}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doc viewer OR waiting state */}
        {completedTypes.length > 0 ? (
          <DocViewer
            docs={docs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            jobId={id}
            isDone={isDone}
          />
        ) : (
          <WaitingDots message={progressMsg} />
        )}
      </div>
    </div>
  );
}