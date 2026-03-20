import { useEffect, useRef, useState } from 'react';
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

/* ── Low-level renderer ──────────────────────────────────────────────── */
function MermaidRenderer({ code, onSvg }) {
  const [svg,   setSvg]   = useState('');
  const [error, setError] = useState(null);
  const idRef = useRef(`mermaid-${++counter}`);

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
      border: '1px solid var(--border)', fontFamily: '"DM Mono",monospace',
      fontSize: 11, color: 'var(--text-muted)',
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

/* ── SVG download helper ─────────────────────────────────────────────── */
function downloadSvg(svgHtml, filename) {
  const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── DiagramCard: preview button + modal ────────────────────────────── */
export default function DiagramCard({ code, label = 'Diagram' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const svgRef = useRef('');

  return (
    <>
      {/* ── Inline card ── */}
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(228,91,17,0.1)', border: '1px solid rgba(228,91,17,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
          {/* Download SVG — available immediately if svg already rendered */}
          <button
            onClick={() => svgRef.current && downloadSvg(svgRef.current, `${label.toLowerCase().replace(/\s+/g,'-')}.svg`)}
            title="Download SVG"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontFamily: '"DM Mono",monospace', fontSize: 11,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            <Download size={12} />
            SVG
          </button>

          {/* View diagram button */}
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
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(228,91,17,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background='rgba(228,91,17,0.08)'; }}
          >
            <Maximize2 size={12} />
            View
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setModalOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 60,
                background: 'rgba(22,22,20,0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0   }}
              exit={{   opacity: 0, scale: 0.95, y: 12   }}
              transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
              style={{
                position: 'fixed', zIndex: 61,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(90vw, 900px)',
                maxHeight: '85vh',
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-hover)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* Modal header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BarChart2 size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => svgRef.current && downloadSvg(svgRef.current, `${label.toLowerCase().replace(/\s+/g,'-')}.svg`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 7,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      fontFamily: '"DM Mono",monospace', fontSize: 11,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
                  >
                    <Download size={12} />
                    Download SVG
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: 6, borderRadius: 7, border: 'none',
                      background: 'transparent', color: 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent'; }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Diagram content */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: 32,
                background: 'var(--bg)',
              }}>
                <MermaidRenderer
                  code={code}
                  onSvg={(s) => { svgRef.current = s; }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pre-render to capture SVG (hidden) */}
      <div style={{ display: 'none' }}>
        <MermaidRenderer code={code} onSvg={(s) => { svgRef.current = s; }} />
      </div>
    </>
  );
}
