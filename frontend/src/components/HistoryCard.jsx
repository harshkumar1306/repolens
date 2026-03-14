import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  DONE:       'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  PROCESSING: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  PENDING:    'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
  FAILED:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
}

const STATUS_LABELS = {
  DONE:       '✓ Done',
  PROCESSING: '⟳ Processing',
  PENDING:    '○ Pending',
  FAILED:     '✕ Failed',
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)

  if (seconds < 60)     return 'just now'
  if (seconds < 3600)   return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400)  return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function HistoryCard({ job }) {
  const isDone = job.status === 'DONE'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">

        {/* Left: repo info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📦</span>
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {job.repoName}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono truncate mb-3">
            {job.repoUrl}
          </p>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[job.status]}`}>
              {STATUS_LABELS[job.status]}
            </span>
            {job._count?.documents > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {job._count.documents} docs
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-600">
              {timeAgo(job.createdAt)}
            </span>
          </div>

          {job.error && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400 truncate">
              {job.error}
            </p>
          )}
        </div>

        {/* Right: action button */}
        {isDone ? (
          <Link
            to={`/results/${job.id}/view`}
            className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            View Docs
          </Link>
        ) : job.status === 'PROCESSING' || job.status === 'PENDING' ? (
          <Link
            to={`/results/${job.id}`}
            className="shrink-0 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Watch
          </Link>
        ) : (
          <Link
            to="/generate"
            className="shrink-0 text-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Retry
          </Link>
        )}
      </div>
    </div>
  )
}