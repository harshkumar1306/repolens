import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Circle, Clock } from 'lucide-react';

const ALL_DOCS = [
  { type: 'OVERVIEW',     label: 'Project Overview'    },
  { type: 'SPEC',         label: 'Reverse Eng. Spec'   },
  { type: 'ARCHITECTURE', label: 'Architecture'         },
  { type: 'TECHSTACK',    label: 'Tech Stack'           },
  { type: 'DATABASE',     label: 'Database Schema'      },
  { type: 'API',          label: 'API Reference'        },
  { type: 'SETUP',        label: 'Setup Guide'          },
  { type: 'DEPLOYMENT',   label: 'Deployment Guide'     },
];

export default function ProgressTracker({ completedTypes = [], currentMessage, rateLimitMsg }) {
  const done = new Set(completedTypes);
  const currentIdx = ALL_DOCS.findIndex((d) => !done.has(d.type));
  const progress = completedTypes.length / ALL_DOCS.length;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto shrink-0"
      style={{
        width: '220px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        padding: '20px 14px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <p
          style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px',
          }}
        >
          Generating
        </p>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
          {completedTypes.length} / {ALL_DOCS.length} docs
        </p>

        {/* Progress bar */}
        <div
          style={{
            marginTop: '10px', height: '3px', borderRadius: '2px',
            background: 'var(--bg-elevated)', overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, #E45B11, #F8AB0B)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Doc checklist */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {ALL_DOCS.map(({ type, label }, i) => {
          const isDone    = done.has(type);
          const isCurrent = !isDone && i === currentIdx;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '7px 10px', borderRadius: '7px',
                background: isCurrent ? 'rgba(228,91,17,0.08)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {isDone ? (
                <CheckCircle size={13} style={{ color: '#F8AB0B', flexShrink: 0 }} />
              ) : isCurrent ? (
                <Loader2
                  size={13}
                  style={{
                    color: '#E45B11', flexShrink: 0,
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : (
                <Circle size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              )}
              <span
                style={{
                  fontFamily: '"DM Mono", monospace', fontSize: '11px',
                  color: isDone
                    ? 'var(--text-secondary)'
                    : isCurrent
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Status / rate-limit message */}
      {(currentMessage || rateLimitMsg) && (
        <div
          style={{
            marginTop: '14px', padding: '10px 12px', borderRadius: '8px',
            background: rateLimitMsg ? 'rgba(251,194,85,0.07)' : 'var(--bg-elevated)',
            border: `1px solid ${rateLimitMsg ? 'rgba(251,194,85,0.2)' : 'var(--border)'}`,
          }}
        >
          {rateLimitMsg ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
              <Clock size={11} style={{ color: '#FBC255', marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#FBC255', lineHeight: 1.5 }}>
                {rateLimitMsg}
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {currentMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}