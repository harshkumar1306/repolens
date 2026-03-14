import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Generate from './pages/Generate'
import Results from './pages/Results'
import History from './pages/History'
import SocketTest from './pages/SocketTest'

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
        {/* Both /results/:jobId and /results/:jobId/view handled by same component */}
        <Route
          path="/results/:jobId"
          element={<ProtectedRoute><Results /></ProtectedRoute>}
        />
        <Route
          path="/results/:jobId/view"
          element={<ProtectedRoute><Results /></ProtectedRoute>}
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