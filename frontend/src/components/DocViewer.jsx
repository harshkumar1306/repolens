import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AnimatePresence, motion } from 'framer-motion';
import DocTab from './DocTab';
import MermaidDiagram from './MermaidDiagram';
import ExportButtons from './ExportButtons';

const DOC_ORDER = [
  'OVERVIEW', 'SPEC', 'ARCHITECTURE', 'TECHSTACK',
  'DATABASE', 'API', 'SETUP', 'DEPLOYMENT',
];

const DOC_LABELS = {
  OVERVIEW:     'Overview',
  SPEC:         'Spec',
  ARCHITECTURE: 'Architecture',
  TECHSTACK:    'Tech Stack',
  DATABASE:     'Database',
  API:          'API Ref',
  SETUP:        'Setup',
  DEPLOYMENT:   'Deploy',
};

const MERMAID_TYPES = new Set(['ARCHITECTURE', 'DATABASE']);

/* Split mermaid code blocks from markdown */
function splitContent(content, hasMermaid) {
  if (!hasMermaid) return { mermaidCode: null, markdownBody: content };
  const match = content.match(/```mermaid\n([\s\S]+?)```/);
  return {
    mermaidCode: match?.[1]?.trim() ?? null,
    markdownBody: match ? content.replace(/```mermaid\n[\s\S]+?```/, '') : content,
  };
}

/* Code block renderer for react-markdown */
function CodeBlock({ node, inline, className, children, ...props }) {
  const lang = /language-(\w+)/.exec(className || '')?.[1];
  if (!inline && lang) {
    return (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        customStyle={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: '"DM Mono", monospace',
          margin: '0',
        }}
        codeTagProps={{ style: { fontFamily: '"DM Mono", monospace' } }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

export default function DocViewer({ docs, activeTab, setActiveTab, jobId, isDone }) {
  const scrollRef   = useRef(null);
  const availTabs   = DOC_ORDER.filter((t) => docs[t]);
  const content     = activeTab ? docs[activeTab] : null;
  const hasMermaid  = MERMAID_TYPES.has(activeTab);

  const { mermaidCode, markdownBody } = content
    ? splitContent(content, hasMermaid)
    : { mermaidCode: null, markdownBody: '' };

  /* Scroll to top on tab change */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeTab]);

  if (!availTabs.length) return null;

  return (
    <div
      style={{
        flex: 1, minWidth: 0, height: '100%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          padding: '0 8px',
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          flexShrink: 0,
          minHeight: '44px',
        }}
      >
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', overflowX: 'auto' }}>
          {availTabs.map((type) => (
            <DocTab
              key={type}
              type={type}
              label={DOC_LABELS[type]}
              isActive={activeTab === type}
              onClick={() => setActiveTab(type)}
            />
          ))}
        </div>

        {isDone && (
          <div style={{ marginLeft: '12px', flexShrink: 0, paddingRight: '4px' }}>
            <ExportButtons jobId={jobId} />
          </div>
        )}
      </div>

      {/* Content area */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ maxWidth: '760px', margin: '0 auto', padding: '36px 32px 64px' }}
          >
            {/* Mermaid diagram */}
            {hasMermaid && mermaidCode && (
              <div style={{ marginBottom: '32px' }}>
                <MermaidDiagram code={mermaidCode} />
              </div>
            )}

            {/* Markdown */}
            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {markdownBody}
              </ReactMarkdown>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}