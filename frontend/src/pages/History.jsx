import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import HistoryCard from '../components/HistoryCard'
import api from '../lib/api'

export default function History() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/jobs')
      .then((res) => setJobs(res.data.jobs))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Repositories
          </h1>
          <Link
            to="/generate"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            + New Analysis
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">{error}</div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No repositories analyzed yet.
            </p>
            <Link
              to="/generate"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
            >
              Analyze your first repo
            </Link>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <HistoryCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}