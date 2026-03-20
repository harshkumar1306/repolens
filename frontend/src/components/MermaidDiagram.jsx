import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, Download, X, Maximize2, Loader2 } from 'lucide-react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor:        '#2E2E2A',
    primaryTextColor:    '#E2E4D5',
    primaryBorderColor:  '#585B4A',
    lineColor:           '#F8AB0B',
    secondaryColor:      '#252521',
    tertiaryColor:       '#161614',
    edgeLabelBackground: '#1C1C1A',
    clusterBkg:          '#252521',
    titleColor:          '#E2E4D5',
    nodeBorder:          '#585B4A',
    fontFamily:          '"DM Mono", monospace',
  },
  flowchart: { htmlLabels: true, curve: 'basis' },
  er:        { diagramPadding: 20 },
});

let counter = 0;

/* ── Renderer ────────────────────────────────────────────────────── */
function MermaidRenderer({ code, onSvg }) {
  const [svg,   setSvg]   = useState('');
  const [error, setError] = useState(null);
  const idRef = useRef(`md-${++counter}`);

  useEffect(() => {
    let cancelled = false;
    setSvg(''); setError(null);
    mermaid.render(idRef.current, code)
      .then(({ svg: s }) => {
        if (!cancelled) { setSvg(s); onSvg?.(s); }
      })
      .catch((e) => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [code]);

  if (error) return (
    <div style={{
      padding: 14, borderRadius: 10, background: 'var(--bg-elevated)',
      border: '1px solid var(--border)', fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--text-muted)',
    }}>
      ⚠ Diagram parse error
      <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
    </div>
  );

  if (!svg) return (
    <div style={{
      padding: 40, display: 'flex', justifyContent: 'center', alignItems: 'center',
      borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    }}>
      <Loader2 size={16} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div
      style={{ overflowX: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/* ── PNG download via canvas ─────────────────────────────────────── */
function downloadPng(svgHtml, filename) {
  // Get dimensions from the SVG string
  const parser = new DOMParser();
  const doc    = parser.parseFromString(svgHtml, 'image/svg+xml');
  const svgEl  = doc.querySelector('svg');
  const w = parseInt(svgEl?.getAttribute('width') || svgEl?.viewBox?.baseVal?.width || 1400, 10) || 1400;
  const h = parseInt(svgEl?.getAttribute('height') || svgEl?.viewBox?.baseVal?.height || 900, 10) || 900;

  // Scale up 2× for crispness
  const scale  = 2;
  const canvas = document.createElement('canvas');
  canvas.width  = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#1C1C1A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  const blob  = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
  const url   = URL.createObjectURL(blob);
  const img   = new Image();
  img.onload  = () => {
    ctx.drawImage(img, 0, 0, w, h);
    const link     = document.createElement('a');
    link.href      = canvas.toDataURL('image/png');
    link.download  = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

/* ── Modal (rendered via portal to avoid transform stacking) ─────── */
function DiagramModal({ code, label, svgRef, onClose }) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="diagram-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(22,22,20,0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          key="diagram-panel"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0   }}
          exit={{   opacity: 0, scale: 0.95, y: 12   }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-hover)',
            borderRadius: 16, overflow: 'hidden',
            width: '100%', maxWidth: 960,
            maxHeight: '88vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 48px 96px rgba(0,0,0,0.75)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart2 size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                {label}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => svgRef.current && downloadPng(svgRef.current, `${label.toLowerCase().replace(/\s+/g, '-')}.png`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 7,
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  fontFamily: '"DM Mono",monospace', fontSize: 11,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <Download size={12} />
                Download PNG
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: 6, borderRadius: 7, border: 'none',
                  background: 'transparent', color: 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Diagram */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: 32, background: 'var(--bg)' }}>
            <MermaidRenderer code={code} onSvg={(s) => { svgRef.current = s; }} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/* ── DiagramCard (exported) ──────────────────────────────────────── */
export default function DiagramCard({ code, label = 'Diagram' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const svgRef = useRef('');
  const filename = `${label.toLowerCase().replace(/\s+/g, '-')}.png`;

  return (
    <>
      {/* Pre-render (hidden) to capture SVG for download */}
      <div style={{ position: 'absolute', left: -9999, top: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <MermaidRenderer code={code} onSvg={(s) => { svgRef.current = s; }} />
      </div>

      {/* Inline card */}
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: 'rgba(228,91,17,0.1)', border: '1px solid rgba(228,91,17,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart2 size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
              {label}
            </p>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Click to view the full diagram
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {/* Download PNG */}
          <button
            onClick={() => svgRef.current && downloadPng(svgRef.current, filename)}
            title="Download PNG"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 7,
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontFamily: '"DM Mono",monospace', fontSize: 11,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Download size={12} />
            PNG
          </button>

          {/* View */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 7,
              border: '1px solid rgba(228,91,17,0.3)',
              background: 'rgba(228,91,17,0.08)',
              color: 'var(--accent)',
              fontFamily: '"DM Mono",monospace', fontSize: 11, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(228,91,17,0.16)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(228,91,17,0.08)'; }}
          >
            <Maximize2 size={12} />
            View
          </button>
        </div>
      </div>

      {/* Portal modal */}
      {modalOpen && (
        <DiagramModal
          code={code}
          label={label}
          svgRef={svgRef}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}