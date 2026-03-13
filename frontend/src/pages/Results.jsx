import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ProgressTracker from '../components/ProgressTracker'
import { useSocket } from '../hooks/useSocket'
import api from '../lib/api'

export default function Results() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [repoName, setRepoName] = useState('')
  const [jobStatus, setJobStatus] = useState(null)

  const { connected, messages, docs, jobDone, jobError, cached } = useSocket(jobId)

  // Fetch job info on load (to get repoName + handle page refresh)
  useEffect(() => {
    if (!jobId) return

    api.get(`/api/jobs/${jobId}`)
      .then((res) => {
        const job = res.data.job
        setRepoName(job.repoName)
        setJobStatus(job.status)

        // If job was already done before we connected (e.g. page refresh)
        // load existing documents from DB
        if (job.status === 'DONE' && job.documents?.length > 0) {
          // Will redirect to show docs — handled below
        }
      })
      .catch((err) => {
        console.error('Failed to fetch job:', err)
      })
  }, [jobId])

  // Once all docs are done, navigate to the full viewer
  // (we stay on this page for now until Phase 7 builds DocViewer)
  useEffect(() => {
    if (jobDone) {
      // Small delay so user sees "All documents generated!" message
      const timer = setTimeout(() => {
        navigate(`/results/${jobId}/view`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [jobDone, jobId, navigate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Socket connection indicator */}
      {!connected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-center text-xs text-yellow-700 dark:text-yellow-400">
          Connecting to live updates...
        </div>
      )}

      <ProgressTracker
        messages={messages}
        docs={docs}
        jobError={jobError}
        cached={cached}
        repoName={repoName}
      />

      {/* Back button */}
      <div className="text-center pb-8">
        <button
          onClick={() => navigate('/generate')}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ← Analyze another repo
        </button>
      </div>
    </div>
  )
}