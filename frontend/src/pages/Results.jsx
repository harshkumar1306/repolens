import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import ProgressTracker from '../components/ProgressTracker'
import DocViewer from '../components/DocViewer'
import { useSocket } from '../hooks/useSocket'
import api from '../lib/api'

export default function Results() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [repoName, setRepoName] = useState('')
  const [initialDocs, setInitialDocs] = useState([])
  const [jobStatus, setJobStatus] = useState(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const docsFetchedRef = useRef(false)

  const { connected, messages, docs: liveDocs, jobDone, jobError, cached } = useSocket(jobId)

  // Fetch job info + documents from API
  const fetchJobDocs = async () => {
    if (docsFetchedRef.current) return
    docsFetchedRef.current = true

    try {
      const res = await api.get(`/api/jobs/${jobId}`)
      const job = res.data.job
      setRepoName(job.repoName)
      setJobStatus(job.status)

      if (job.documents?.length > 0) {
        setInitialDocs(job.documents)
      }
    } catch (err) {
      console.error('Failed to fetch job:', err)
    }
  }

  // On mount — fetch job. If already DONE, load docs immediately.
  // If PENDING/PROCESSING, the socket will tell us when it's done.
  useEffect(() => {
    if (!jobId) return

    api.get(`/api/jobs/${jobId}`)
      .then((res) => {
        const job = res.data.job
        setRepoName(job.repoName)
        setJobStatus(job.status)

        if (job.status === 'DONE' && job.documents?.length > 0) {
          // Already done (e.g. page refresh, or fast cache hit)
          setInitialDocs(job.documents)
          docsFetchedRef.current = true
        }
      })
      .catch((err) => console.error('Failed to fetch job:', err))
      .finally(() => setLoadingJob(false))
  }, [jobId])

  // When socket fires jobDone, fetch docs from API
  // This handles the cache race condition — even if we missed socket events,
  // we always pull the final docs from the database
  useEffect(() => {
    if (jobDone) {
      fetchJobDocs().then(() => setLoadingJob(false))
    }
  }, [jobDone])

  // Also handle the case where job was already DONE when socket connected
  // (jobStatus set from initial fetch, but we need to make sure docs are loaded)
  useEffect(() => {
    if (jobStatus === 'DONE' && initialDocs.length === 0 && !loadingJob) {
      fetchJobDocs()
    }
  }, [jobStatus, loadingJob])

  // Merge live WebSocket docs with DB docs
  const mergedDocs = () => {
    const map = {}

    initialDocs.forEach((doc) => {
      map[doc.type] = doc.content
    })

    Object.entries(liveDocs).forEach(([type, content]) => {
      map[type] = content
    })

    return Object.entries(map).map(([type, content]) => ({ type, content }))
  }

  const allDocs = mergedDocs()
  const isDone = jobStatus === 'DONE' || jobDone
  const showViewer = isDone && allDocs.length > 0

  if (loadingJob && !showViewer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-600">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  // Show full doc viewer once done
  if (showViewer) {
    return (
      <>
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate('/generate')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              ← New analysis
            </button>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              History
            </button>
          </div>
        </div>
        <DocViewer
          documents={allDocs}
          repoName={repoName}
          jobId={jobId}
        />
      </>
    )
  }

  // Show progress tracker while generating
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {!connected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-center text-xs text-yellow-700 dark:text-yellow-400">
          Connecting to live updates...
        </div>
      )}

      <ProgressTracker
        messages={messages}
        docs={liveDocs}
        jobError={jobError}
        cached={cached}
        repoName={repoName}
      />

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