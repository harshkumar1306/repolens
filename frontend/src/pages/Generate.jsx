import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../lib/api'

export default function Generate() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const trimmed = repoUrl.trim()
    if (!trimmed) return

    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/api/jobs', { repoUrl: trimmed })
      const { jobId } = res.data

      // Navigate to results page — WebSocket connection happens there
      navigate(`/results/${jobId}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const exampleRepos = [
    'https://github.com/expressjs/express',
    'https://github.com/fastapi/fastapi',
    'https://github.com/vitejs/vite',
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Generate Documentation
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Paste any public GitHub repository URL to get started.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub Repository URL
          </label>

          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/owner/repository"
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-4"
          />

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !repoUrl.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating job...
              </>
            ) : (
              <>
                <span>🔍</span>
                Analyze Repository
              </>
            )}
          </button>
        </div>

        {/* Example repos */}
        <div className="mt-6">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center mb-3">
            Try an example
          </p>
          <div className="flex flex-col gap-2">
            {exampleRepos.map((url) => (
              <button
                key={url}
                onClick={() => setRepoUrl(url)}
                disabled={loading}
                className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 text-left px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
              >
                {url}
              </button>
            ))}
          </div>
        </div>

        {/* Limits note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          Works with public repos under 50MB and 2,000 files.
        </p>
      </main>
    </div>
  )
}