import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Placeholder pages — we'll build these in later phases
function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🔍 RepoLens
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Phase 1 complete — backend + frontend scaffolding working!
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App