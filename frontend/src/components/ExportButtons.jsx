import { useState } from 'react'
import api from '../lib/api'

function DownloadButton({ onClick, loading, icon, label, colorClass }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${colorClass}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon
      )}
      {loading ? 'Generating...' : label}
    </button>
  )
}

export default function ExportButtons({ jobId }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [zipLoading, setZipLoading] = useState(false)
  const [error, setError] = useState(null)

  const downloadFile = async (type) => {
    const isZip = type === 'zip'
    const setter = isZip ? setZipLoading : setPdfLoading
    setError(null)
    setter(true)

    try {
      const response = await api.get(`/api/export/${jobId}/${type}`, {
        responseType: 'blob', // Tell axios to treat response as binary
      })

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers['content-disposition']
      let filename = `repolens-docs.${type}`
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      // Create a temporary URL and click it to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`${type} download failed:`, err)
      setError(`Failed to generate ${type.toUpperCase()}. Please try again.`)
    } finally {
      setter(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-500 mr-2">{error}</span>
      )}

      <DownloadButton
        onClick={() => downloadFile('pdf')}
        loading={pdfLoading}
        label="PDF"
        colorClass="bg-red-600 hover:bg-red-700"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      <DownloadButton
        onClick={() => downloadFile('zip')}
        loading={zipLoading}
        label="ZIP"
        colorClass="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
      />
    </div>
  )
}