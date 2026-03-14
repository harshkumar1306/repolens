import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

let diagramCounter = 0

export default function MermaidDiagram({ code }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(false)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!code?.trim() || !containerRef.current) return

    const id = `mermaid-${++diagramCounter}`
    let cancelled = false

    async function render() {
      try {
        setError(false)
        setRendered(false)

        const isDark = document.documentElement.classList.contains('dark')

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          flowchart: { useMaxWidth: true, htmlLabels: true },
          er: { useMaxWidth: true },
        })

        const { svg } = await mermaid.render(id, code.trim())

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg

          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            svgEl.style.maxWidth = '100%'
            svgEl.style.height = 'auto'
          }
          setRendered(true)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Mermaid render failed:', err.message)
          setError(true)
        }
      }
    }

    render()

    // Re-render when dark mode class changes on <html>
    const observer = new MutationObserver(() => {
      if (!cancelled) render()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [code])

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 overflow-hidden">
        <div className="px-4 py-2 border-b border-yellow-200 dark:border-yellow-800">
          <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">
            ⚠️ Diagram could not be rendered — showing source
          </span>
        </div>
        <pre className="p-4 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono">
          {code}
        </pre>
      </div>
    )
  }

  return (
    <div className="my-6">
      {/* Loading skeleton */}
      {!rendered && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600 text-sm animate-pulse">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Rendering diagram...
          </div>
        </div>
      )}

      {/* Rendered diagram */}
      <div
        ref={containerRef}
        className={`
          flex justify-center overflow-x-auto rounded-xl border
          border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-900 p-6
          transition-opacity duration-300
          ${rendered ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}
        `}
      />
    </div>
  )
}