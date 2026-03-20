import { useEffect, useRef, useState } from 'react';
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

export default function MermaidDiagram({ code }) {
  const [svg, setSvg]     = useState('');
  const [error, setError] = useState(null);
  const idRef             = useRef(`mermaid-${++counter}`);

  useEffect(() => {
    let cancelled = false;
    setSvg('');
    setError(null);

    mermaid
      .render(idRef.current, code)
      .then(({ svg: s }) => { if (!cancelled) setSvg(s); })
      .catch((e)         => { if (!cancelled) setError(String(e)); });

    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div
        style={{
          padding: '14px 16px', borderRadius: '10px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          fontFamily: '"DM Mono", monospace', fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        ⚠ Diagram parse error — showing raw content
        <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        style={{
          padding: '40px', borderRadius: '10px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
          Rendering diagram…
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px', borderRadius: '12px', overflowX: 'auto',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}