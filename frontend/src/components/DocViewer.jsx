import { useState } from 'react'
import DocTab from './DocTab'
import ExportButtons from './ExportButtons'

const DOC_TABS = [
  { type: 'OVERVIEW',     label: 'Overview',     icon: '📋' },
  { type: 'SPEC',         label: 'Spec',         icon: '🔧' },
  { type: 'ARCHITECTURE', label: 'Architecture', icon: '🏗️' },
  { type: 'TECHSTACK',    label: 'Tech Stack',   icon: '⚙️' },
  { type: 'DATABASE',     label: 'Database',     icon: '🗄️' },
  { type: 'API',          label: 'API',          icon: '🔌' },
  { type: 'SETUP',        label: 'Setup',        icon: '💻' },
  { type: 'DEPLOYMENT',   label: 'Deployment',   icon: '🚀' },
]

export default function DocViewer({ documents, repoName, jobId }) {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

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

          {/* Repo name + export buttons */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">🔍</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {repoName}
              </span>
              <span className="shrink-0 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                {documents.length} docs
              </span>
            </div>

            <ExportButtons jobId={jobId} />
          </div>

          {/* Tab row */}
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
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                    whitespace-nowrap transition-colors
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