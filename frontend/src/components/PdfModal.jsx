import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Archive, Download, CheckSquare, Square } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

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
  const available  = DOC_ORDER.filter((d) => completedTypes.includes(d.type));
  const [selected, setSelected] = useState(new Set(available.map((d) => d.type)));
  const [pdfLoading, setPdfLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const toggle    = (type) => setSelected((p) => { const n = new Set(p); n.has(type) ? n.delete(type) : n.add(type); return n; });
  const toggleAll = () => setSelected(selected.size === available.length ? new Set() : new Set(available.map((d) => d.type)));

  const downloadBlob = async (format, setLoading) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/export/${jobId}/${format}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `repolens-${jobId}.${format === 'zip' ? 'zip' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || `${format.toUpperCase()} export failed`);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="pdf-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(22,22,20,0.82)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          key="pdf-panel"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1,    y: 0   }}
          exit={{   opacity: 0, scale: 0.95, y: 10   }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hover)',
            borderRadius: 16, overflow: 'hidden',
            width: '100%', maxWidth: 400,
            boxShadow: '0 32px 72px rgba(0,0,0,0.65)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '15px 20px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                Export Documentation
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ padding: 6, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Doc selection */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Select documents for PDF
              </p>
              <button
                onClick={toggleAll}
                style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {selected.size === available.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 260, overflowY: 'auto' }}>
              {available.map(({ type, label }) => {
                const checked = selected.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggle(type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 8, border: 'none',
                      background: checked ? 'rgba(228,91,17,0.07)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {checked
                      ? <CheckSquare size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      : <Square      size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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

          {/* Actions — PDF and ZIP are fully separate */}
          <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* PDF */}
            <button
              onClick={() => downloadBlob('pdf', setPdfLoading)}
              disabled={pdfLoading || selected.size === 0}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 16px', borderRadius: 9, border: 'none',
                background: selected.size > 0 ? 'var(--accent)' : 'var(--bg-elevated)',
                color: selected.size > 0 ? 'white' : 'var(--text-muted)',
                fontFamily: '"DM Mono",monospace', fontSize: 12, fontWeight: 500,
                cursor: selected.size > 0 ? 'pointer' : 'default',
                opacity: pdfLoading ? 0.65 : 1, transition: 'all 0.15s',
              }}
            >
              <Download size={13} />
              {pdfLoading ? 'Generating PDF…' : `Download PDF (${selected.size} doc${selected.size !== 1 ? 's' : ''})`}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* ZIP — downloads ALL docs as markdown, independent of selection */}
            <button
              onClick={() => downloadBlob('zip', setZipLoading)}
              disabled={zipLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 16px', borderRadius: 9,
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                fontFamily: '"DM Mono",monospace', fontSize: 12,
                cursor: 'pointer', opacity: zipLoading ? 0.65 : 1, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <Archive size={13} />
              {zipLoading ? 'Zipping…' : 'Download All as ZIP (Markdown)'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}