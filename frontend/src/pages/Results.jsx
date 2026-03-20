import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, Loader2, Circle, Clock,
  ExternalLink, XCircle, FileText, Download,
} from 'lucide-react';
import api from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { AppContext } from '../App';
import DocViewer from '../components/DocViewer';
import PdfModal from '../components/PdfModal';

/* ─── Constants ──────────────────────────────────────────────────────── */
const DOC_ORDER = [
  'OVERVIEW', 'SPEC', 'ARCHITECTURE', 'TECHSTACK',
  'DATABASE', 'API', 'SETUP', 'DEPLOYMENT',
];

const DOC_META = {
  OVERVIEW:     { label: 'Project Overview',     icon: '◆' },
  SPEC:         { label: 'Reverse Eng. Spec',     icon: '◈' },
  ARCHITECTURE: { label: 'Architecture',          icon: '⬡' },
  TECHSTACK:    { label: 'Tech Stack',            icon: '◉' },
  DATABASE:     { label: 'Database Schema',       icon: '◫' },
  API:          { label: 'API Reference',         icon: '⬖' },
  SETUP:        { label: 'Setup Guide',           icon: '◔' },
  DEPLOYMENT:   { label: 'Deployment Guide',      icon: '◐' },
};

/* ─── Waiting animation ──────────────────────────────────────────────── */
function WaitingDots({ message }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {['#E45B11', '#F4860D', '#F8AB0B'].map((color, i) => (
          <motion.span
            key={i}
            style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: color }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.75, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {message && (
        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: 'var(--text-muted)' }}>
          {message}
        </p>
      )}
    </div>
  );
}

/* ─── Sidebar slot: GENERATING state ────────────────────────────────── */
function GeneratingSidebar({ completedTypes, progressMsg, rateLimitMsg, repoName, onBack, onCancel }) {
  const progress = completedTypes.length / DOC_ORDER.length;
  const currentIdx = DOC_ORDER.findIndex((t) => !completedTypes.includes(t));
  const done = new Set(completedTypes);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 4 }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 10px', borderRadius: 8, border: 'none',
          background: 'transparent', color: 'var(--text-muted)',
          fontFamily: '"DM Mono",monospace', fontSize: 11,
          cursor: 'pointer', marginBottom: 14, width: '100%', textAlign: 'left',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='var(--bg-elevated)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent'; }}
      >
        <ArrowLeft size={12} />
        {repoName || 'Back'}
      </button>

      {/* Progress header */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>
          Generating
        </p>
        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--text-muted)' }}>
          {completedTypes.length} / {DOC_ORDER.length} docs
        </p>
        <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#E45B11,#F8AB0B)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {DOC_ORDER.map((type, i) => {
          const isDone    = done.has(type);
          const isCurrent = !isDone && i === currentIdx;
          const meta      = DOC_META[type];
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '6px 8px', borderRadius: 7,
                background: isCurrent ? 'rgba(228,91,17,0.08)' : 'transparent',
              }}
            >
              {isDone
                ? <CheckCircle size={13} style={{ color: '#F8AB0B', flexShrink: 0 }} />
                : isCurrent
                ? <Loader2 size={13} style={{ color: '#E45B11', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                : <Circle   size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              }
              <span style={{
                fontFamily: '"DM Mono",monospace', fontSize: 11,
                color: isDone ? 'var(--text-secondary)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {meta.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Status / rate-limit */}
      {(progressMsg || rateLimitMsg) && (
        <div style={{
          margin: '10px 0',
          padding: '9px 11px', borderRadius: 8,
          background: rateLimitMsg ? 'rgba(251,194,85,0.07)' : 'var(--bg-elevated)',
          border: `1px solid ${rateLimitMsg ? 'rgba(251,194,85,0.2)' : 'var(--border)'}`,
        }}>
          {rateLimitMsg
            ? <div style={{ display: 'flex', gap: 7 }}>
                <Clock size={11} style={{ color: '#FBC255', marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: '#FBC255', lineHeight: 1.5 }}>{rateLimitMsg}</p>
              </div>
            : <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{progressMsg}</p>
          }
        </div>
      )}

      {/* Cancel */}
      <button
        onClick={onCancel}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '8px 12px', borderRadius: 8,
          border: '1px solid rgba(228,91,17,0.2)',
          background: 'transparent', color: 'var(--accent)',
          fontFamily: '"DM Mono",monospace', fontSize: 11,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background='rgba(228,91,17,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}
      >
        <XCircle size={12} />
        Cancel
      </button>
    </div>
  );
}

/* ─── Sidebar slot: DONE state ───────────────────────────────────────── */
function DoneSidebar({ docs, activeTab, setActiveTab, jobId, completedTypes, repoUrl, repoName, onBack }) {
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 4 }}>
        {/* Back + repo name */}
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 10px', borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--text-muted)',
              fontFamily: '"DM Mono",monospace', fontSize: 11,
              cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='var(--bg-elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent'; }}
          >
            <ArrowLeft size={12} />
            Dashboard
          </button>

          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', margin: '4px 0 0',
                borderRadius: 7, textDecoration: 'none',
                fontFamily: '"DM Mono",monospace', fontSize: 11,
                color: 'var(--text-muted)', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color='var(--accent-amber)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-muted)'; }}
            >
              <ExternalLink size={11} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {repoName}
              </span>
            </a>
          )}
        </div>

        {/* Section label */}
        <p style={{
          fontFamily: '"DM Mono",monospace', fontSize: 10,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--text-muted)', padding: '0 10px', marginBottom: 6,
        }}>
          Documents
        </p>

        {/* Doc list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {DOC_ORDER.filter((t) => docs[t]).map((type) => {
            const meta     = DOC_META[type];
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: '"DM Mono",monospace', fontSize: 12,
                  cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background='rgba(226,228,213,0.04)'; e.currentTarget.style.color='var(--text-primary)'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; } }}
              >
                <span style={{ fontSize: 10, color: isActive ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                  {meta.icon}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {meta.label}
                </span>
                <CheckCircle size={11} style={{ color: '#F8AB0B', marginLeft: 'auto', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        {/* Export buttons */}
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p style={{
            fontFamily: '"DM Mono",monospace', fontSize: 10,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-muted)', padding: '0 2px', marginBottom: 2,
          }}>
            Export
          </p>
          <button
            onClick={() => setPdfOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 10px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontFamily: '"DM Mono",monospace', fontSize: 11,
              cursor: 'pointer', width: '100%', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
          >
            <Download size={12} />
            PDF / ZIP Download
          </button>
        </div>
      </div>

      {pdfOpen && (
        <PdfModal
          jobId={jobId}
          completedTypes={completedTypes}
          onClose={() => setPdfOpen(false)}
        />
      )}
    </>
  );
}

/* ─── Results page ───────────────────────────────────────────────────── */
export default function Results() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { setSidebarSlot } = useContext(AppContext);

  const [docs,         setDocs]         = useState({});
  const [status,       setStatus]       = useState('loading');
  const [progressMsg,  setProgressMsg]  = useState('Initializing…');
  const [rateLimitMsg, setRateLimitMsg] = useState(null);
  const [activeTab,    setActiveTab]    = useState(null);
  const [repoUrl,      setRepoUrl]      = useState('');
  const [repoName,     setRepoName]     = useState('');

  /* Parse owner/repo from URL */
  const parseRepoName = (url) => {
    try {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      return parts.slice(0, 2).join('/');
    } catch {
      return url;
    }
  };

  /* Cancel = navigate away */
  const handleCancel = () => navigate('/');
  const handleBack   = () => navigate('/');

  /* Load existing job */
  useEffect(() => {
    api.get(`/api/jobs/${id}`)
      .then((res) => {
        const job = res.data;
        const url  = job.repoUrl || '';
        const name = parseRepoName(url) || job.repoName || 'Repository';
        setRepoUrl(url);
        setRepoName(name);

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

  /* Socket */
  const handlers = {
    'job:status':     useCallback(({ message }) => { setProgressMsg(message); setStatus('processing'); }, []),
    'job:rateLimit':  useCallback(({ message }) => { setRateLimitMsg(message); }, []),
    'job:docComplete': useCallback(({ type, content }) => {
      setRateLimitMsg(null);
      setDocs((prev) => ({ ...prev, [type]: content }));
      setActiveTab((prev) => prev || type);
    }, []),
    'job:done':   useCallback(() => { setStatus('done'); }, []),
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
    'job:error': useCallback(({ message }) => { setStatus('failed'); setProgressMsg(message); }, []),
  };

  useSocket(status === 'processing' ? id : null, handlers);

  const isProcessing   = status === 'processing' || status === 'loading';
  const isDone         = status === 'done';
  const completedTypes = DOC_ORDER.filter((t) => docs[t]);

  /* ── Inject sidebar slot ── */
  useEffect(() => {
    if (isProcessing) {
      setSidebarSlot(
        <GeneratingSidebar
          key="generating"
          completedTypes={completedTypes}
          progressMsg={progressMsg}
          rateLimitMsg={rateLimitMsg}
          repoName={repoName}
          onBack={handleBack}
          onCancel={handleCancel}
        />
      );
    } else if (isDone) {
      setSidebarSlot(
        <DoneSidebar
          key="done"
          docs={docs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          jobId={id}
          completedTypes={completedTypes}
          repoUrl={repoUrl}
          repoName={repoName}
          onBack={handleBack}
        />
      );
    }
    // Cleanup: remove slot when leaving this page
    return () => {};
  }, [isProcessing, isDone, completedTypes, progressMsg, rateLimitMsg, docs, activeTab, repoUrl, repoName]);

  /* Remove slot on unmount */
  useEffect(() => {
    return () => setSidebarSlot(null);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', flexShrink: 0, minHeight: 44,
        background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)',
      }}>
        {repoUrl ? (
          <>
            <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: 'var(--text-muted)' }}>
              github.com/
            </span>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13,
                color: 'var(--text-primary)', textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color='var(--accent-amber)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-primary)'; }}
            >
              {repoName}
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          </>
        ) : (
          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: 'var(--text-muted)' }}>
            Loading…
          </span>
        )}

        {/* Status pill */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
          <motion.span
            style={{
              display: 'block', width: 7, height: 7, borderRadius: '50%',
              background: isDone ? '#F8AB0B' : isProcessing ? '#E45B11' : '#585B4A',
            }}
            animate={isProcessing ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--text-muted)' }}>
            {isDone ? 'Complete' : isProcessing ? 'Generating…' : status}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {completedTypes.length > 0 ? (
          <DocViewer docs={docs} activeTab={activeTab} />
        ) : (
          <WaitingDots message={progressMsg} />
        )}
      </div>
    </div>
  );
}
