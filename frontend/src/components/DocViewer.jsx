import { useState } from 'react'
import DocTab from './DocTab'

const DOC_TABS = [
  { type: 'OVERVIEW',     label: 'Overview',      icon: '📋' },
  { type: 'SPEC',         label: 'Spec',           icon: '🔧' },
  { type: 'ARCHITECTURE', label: 'Architecture',   icon: '🏗️' },
  { type: 'TECHSTACK',    label: 'Tech Stack',     icon: '⚙️' },
  { type: 'DATABASE',     label: 'Database',       icon: '🗄️' },
  { type: 'API',          label: 'API',            icon: '🔌' },
  { type: 'SETUP',        label: 'Setup',          icon: '💻' },
  { type: 'DEPLOYMENT',   label: 'Deployment',     icon: '🚀' },
]

export default function DocViewer({ documents, repoName, jobId }) {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

  // Build a lookup map from type → content
  const docMap = {}
  documents.forEach((doc) => {
    docMap[doc.type] = doc.content
  })

  const activeContent = docMap[activeTab]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">

          {/* Repo name + export buttons row */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {repoName}
              </span>
              <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                {documents.length} docs
              </span>
            </div>

            {/* Export buttons — wired up in Phase 8 */}
            <div className="flex items-center gap-2">
              <a
                href={`${import.meta.env.VITE_API_URL}/api/export/${jobId}/pdf`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </a>
              <a
                href={`${import.meta.env.VITE_API_URL}/api/export/${jobId}/zip`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                ZIP
              </a>
            </div>
          </div>

          {/* Scrollable tab row */}
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {DOC_TABS.map((tab) => {
              const isAvailable = !!docMap[tab.type]
              const isActive = activeTab === tab.type

              return (
                <button
                  key={tab.type}
                  onClick={() => isAvailable && setActiveTab(tab.type)}
                  disabled={!isAvailable}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : isAvailable
                      ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Document content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeContent ? (
          <DocTab content={activeContent} />
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p className="text-4xl mb-3">📄</p>
            <p>This document was not generated.</p>
          </div>
        )}
      </div>
    </div>
  )
}