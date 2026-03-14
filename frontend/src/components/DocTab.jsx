import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MermaidDiagram from './MermaidDiagram'

export default function DocTab({ content }) {
  const [copied, setCopied] = useState(false)
  const isDark = document.documentElement.classList.contains('dark')

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-500">Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>

      {/* Markdown content */}
      <div className="pt-8 text-gray-800 dark:text-gray-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              const language = match?.[1]
              const codeString = String(children).replace(/\n$/, '')

              if (!inline && language === 'mermaid') {
                return <MermaidDiagram code={codeString} />
              }

              if (!inline && language) {
                return (
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="!rounded-xl !text-sm my-4"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                )
              }

              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            },

            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                {children}
              </h4>
            ),

            p: ({ children }) => (
              <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-7">{children}</li>
            ),

            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50 dark:bg-gray-800">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                {children}
              </td>
            ),

            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 py-1 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-xl">
                <div className="text-gray-600 dark:text-gray-400 italic">
                  {children}
                </div>
              </blockquote>
            ),

            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {children}
              </a>
            ),

            hr: () => (
              <hr className="my-6 border-gray-200 dark:border-gray-800" />
            ),

            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900 dark:text-white">
                {children}
              </strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}