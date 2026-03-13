const DOC_TYPES = [
    { type: 'OVERVIEW', label: 'Project Overview', icon: '📋' },
    { type: 'SPEC', label: 'Reverse Engineer Spec', icon: '🔧' },
    { type: 'ARCHITECTURE', label: 'System Architecture', icon: '🏗️' },
    { type: 'TECHSTACK', label: 'Tech Stack', icon: '⚙️' },
    { type: 'DATABASE', label: 'Database Schema', icon: '🗄️' },
    { type: 'API', label: 'API Reference', icon: '🔌' },
    { type: 'SETUP', label: 'Developer Setup', icon: '💻' },
    { type: 'DEPLOYMENT', label: 'Deployment Guide', icon: '🚀' },
  ]
  
  export default function ProgressTracker({ messages, docs, jobError, cached, repoName }) {
    const completedTypes = Object.keys(docs)
    const completedCount = completedTypes.length
    const totalCount = DOC_TYPES.length
    const progressPercent = Math.round((completedCount / totalCount) * 100)
  
    // Get the latest status message
    const latestMessage = messages
      .filter((m) => m.type === 'status' || m.type === 'rateLimit')
      .at(-1)
  
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
  
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">
            {jobError ? '❌' : cached ? '⚡' : '🔍'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {jobError
              ? 'Generation Failed'
              : cached
              ? 'Loaded from Cache!'
              : 'Analyzing Repository'}
          </h1>
          {repoName && (
            <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
              {repoName}
            </p>
          )}
        </div>
  
        {/* Error state */}
        {jobError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-sm text-red-600 dark:text-red-400 text-center">
            {jobError}
          </div>
        )}
  
        {/* Cached banner */}
        {cached && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 text-sm text-green-600 dark:text-green-400 text-center">
            ⚡ Loaded from cache — docs ready instantly!
          </div>
        )}
  
        {/* Progress bar */}
        {!jobError && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>{latestMessage?.message || 'Starting...'}</span>
              <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
  
        {/* Document checklist */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {DOC_TYPES.map((doc, i) => {
            const isDone = completedTypes.includes(doc.type)
            const isLast = i === DOC_TYPES.length - 1
  
            return (
              <div
                key={doc.type}
                className={`flex items-center gap-3 px-5 py-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
              >
                {/* Status icon */}
                <div className="w-6 flex justify-center">
                  {isDone ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : jobError ? (
                    <span className="text-gray-300 dark:text-gray-700 text-lg">○</span>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-700 rounded-full" />
                  )}
                </div>
  
                {/* Doc icon + label */}
                <span className="text-base">{doc.icon}</span>
                <span className={`text-sm font-medium ${isDone ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {doc.label}
                </span>
  
                {/* Generating spinner for in-progress */}
                {!isDone && !jobError && completedCount > 0 && (
                  <svg className="ml-auto w-3 h-3 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }