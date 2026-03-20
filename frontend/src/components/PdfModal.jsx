import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Archive, Download, CheckSquare, Square } from 'lucide-react';
import api from '../lib/api';

const DOC_ORDER = [
  { type: 'OVERVIEW',     label: 'Project Overview'       },
  { type: 'SPEC',         label: 'Reverse Engineer Spec'  },
  { type: 'ARCHITECTURE', label: 'System Architecture'    },
  { type: 'TECHSTACK',    label: 'Tech Stack Breakdown'   },
  { type: 'DATABASE',     label: 'Database Schema'        },
  { type: 'API',          label: 'API Reference'          },
  { type: 'SETUP',        label: 'Developer Setup Guide'  },
  { type: 'DEPLOYMENT',   label: 'Deployment Guide'       },
];

export default function PdfModal({ jobId, completedTypes, onClose }) {
  const available = DOC_ORDER.filter((d) => completedTypes.includes(d.type));
  const [selected,    setSelected]    = useState(new Set(available.map((d) => d.type)));
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [zipLoading,  setZipLoading]  = useState(false);

  const toggle = (type) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === available.length
      ? new Set()
      : new Set(available.map((d) => d.type)));
  };

  const download = async (format) => {
    const setLoading = format === 'pdf' ? setPdfLoading : setZipLoading;
    setLoading(true);
    try {
      const res = await api.get(`/api/export/${jobId}/${format}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `repolens-${jobId}.${format === 'zip' ? 'zip' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(22,22,20,0.8)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1,    y: 0   }}
          exit={{   opacity: 0, scale: 0.95, y: 10   }}
          transition={{ duration: 0.18, ease: [0.4,0,0.2,1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hover)',
            borderRadius: 16, overflow: 'hidden',
            width: '100%', maxWidth: 420,
            boxShadow: '0 32px 72px rgba(0,0,0,0.65)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                Export Documentation
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6, borderRadius: 7, border: 'none', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.color='var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Doc select list */}
          <div style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Documents
              </p>
              <button
                onClick={toggleAll}
                style={{
                  fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--accent)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                {selected.size === available.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 280, overflowY: 'auto' }}>
              {available.map(({ type, label }) => {
                const checked = selected.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggle(type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8, border: 'none',
                      background: checked ? 'rgba(228,91,17,0.06)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background='var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background='transparent'; }}
                  >
                    {checked
                      ? <CheckSquare size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      : <Square      size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    }
                    <span style={{
                      fontFamily: '"DM Mono",monospace', fontSize: 12,
                      color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8,
          }}>
            {/* Full PDF */}
            <button
              onClick={() => download('pdf')}
              disabled={pdfLoading || selected.size === 0}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 14px', borderRadius: 9,
                background: selected.size > 0 ? 'var(--accent)' : 'var(--bg-elevated)',
                border: 'none',
                color: selected.size > 0 ? 'white' : 'var(--text-muted)',
                fontFamily: '"DM Mono",monospace', fontSize: 12, fontWeight: 500,
                cursor: selected.size > 0 ? 'pointer' : 'default',
                opacity: pdfLoading ? 0.65 : 1, transition: 'all 0.15s',
              }}
            >
              <Download size={13} />
              {pdfLoading ? 'Generating…' : 'Download PDF'}
            </button>

            {/* ZIP */}
            <button
              onClick={() => download('zip')}
              disabled={zipLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 14px', borderRadius: 9,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                fontFamily: '"DM Mono",monospace', fontSize: 12,
                cursor: 'pointer', opacity: zipLoading ? 0.65 : 1, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
            >
              <Archive size={13} />
              {zipLoading ? '…' : 'ZIP'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
