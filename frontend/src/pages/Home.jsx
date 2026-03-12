import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          🔍 RepoLens
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
          Paste any GitHub URL. Get instant AI-generated documentation.
        </p>

        {!loading && (
          user ? (
            <Link
              to="/generate"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Generate Docs →
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity"
            >
              Sign in to Get Started
            </Link>
          )
        )}
      </main>
    </div>
  )
}