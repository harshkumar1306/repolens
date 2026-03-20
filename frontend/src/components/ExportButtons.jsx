import { useState } from 'react';
import { FileText, Archive } from 'lucide-react';
import api from '../lib/api';

function ExportBtn({ label, icon: Icon, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 10px', borderRadius: '7px',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
        fontFamily: '"DM Mono", monospace', fontSize: '11px',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.15s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <Icon size={12} />
      {loading ? '…' : label}
    </button>
  );
}

export default function ExportButtons({ jobId }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const download = async (type) => {
    const setLoading = type === 'pdf' ? setPdfLoading : setZipLoading;
    setLoading(true);
    try {
      const res = await api.get(`/api/export/${jobId}/${type}`, {
        responseType: 'blob',
      });
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `repolens-${jobId}.${type === 'zip' ? 'zip' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <ExportBtn label="PDF" icon={FileText} onClick={() => download('pdf')} loading={pdfLoading} />
      <ExportBtn label="ZIP" icon={Archive}  onClick={() => download('zip')} loading={zipLoading} />
    </div>
  );
}