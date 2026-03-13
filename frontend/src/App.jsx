import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Generate from './pages/Generate'
import Results from './pages/Results'
import History from './pages/History'
import SocketTest from './pages/SocketTest'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

// Placeholder for the full doc viewer — built in Phase 7
function DocViewerPlaceholder() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Documents Generated!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Full doc viewer coming in Phase 7.
        </p>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/socket-test" element={<SocketTest />} />
        <Route
          path="/generate"
          element={<ProtectedRoute><Generate /></ProtectedRoute>}
        />
        <Route
          path="/results/:jobId"
          element={<ProtectedRoute><Results /></ProtectedRoute>}
        />
        <Route
          path="/results/:jobId/view"
          element={<ProtectedRoute><DocViewerPlaceholder /></ProtectedRoute>}
        />
        <Route
          path="/history"
          element={<ProtectedRoute><History /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App