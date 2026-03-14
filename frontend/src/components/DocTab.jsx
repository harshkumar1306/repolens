import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MermaidDiagram from './MermaidDiagram'

export default function DocTab({ content }) {
  const [copied, setCopied] = useState(false)

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
      <div className="prose prose-gray dark:prose-invert max-w-none pt-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Intercept code blocks — render mermaid as diagrams, others as syntax-highlighted code
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
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    className="rounded-xl text-sm"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                )
              }

              // Inline code
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            },

            // Style tables
            table({ children }) {
              return (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                    {children}
                  </table>
                </div>
              )
            },
            th({ children }) {
              return (
                <th className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  {children}
                </th>
              )
            },
            td({ children }) {
              return (
                <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                  {children}
                </td>
              )
            },

            // Style headings
            h1({ children }) {
              return <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{children}</h1>
            },
            h2({ children }) {
              return <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">{children}</h2>
            },
            h3({ children }) {
              return <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-5 mb-2">{children}</h3>
            },

            // Style blockquotes
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 py-1 my-4 text-gray-600 dark:text-gray-400 italic bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                  {children}
                </blockquote>
              )
            },

            // Style links
            a({ href, children }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {children}
                </a>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}