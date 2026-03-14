import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

let diagramCounter = 0

export default function MermaidDiagram({ code }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!code?.trim() || !containerRef.current) return

    const id = `mermaid-${++diagramCounter}`
    const isDark = document.documentElement.classList.contains('dark')

    // Re-initialize with correct theme every render
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      flowchart: { useMaxWidth: true, htmlLabels: true },
      er: { useMaxWidth: true },
    })

    let cancelled = false

    async function render() {
      try {
        setError(null)
        setRendered(false)

        // Clean up the code — remove any leading/trailing whitespace
        const cleanCode = code.trim()

        const { svg } = await mermaid.render(id, cleanCode)

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg

          // Make SVG responsive
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

    return () => {
      cancelled = true
    }
  }, [code])

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 overflow-hidden">
        <div className="px-4 py-2 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
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
    <div className="my-6 relative">
      {/* Loading skeleton */}
      {!rendered && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 flex items-center justify-center animate-pulse">
          <div className="text-gray-400 dark:text-gray-600 text-sm">Rendering diagram...</div>
        </div>
      )}

      {/* Rendered diagram */}
      <div
        ref={containerRef}
        className={`
          flex justify-center overflow-x-auto rounded-xl border border-gray-200
          dark:border-gray-700 bg-white dark:bg-gray-900 p-6
          ${rendered ? 'block' : 'hidden'}
        `}
      />
    </div>
  )
}