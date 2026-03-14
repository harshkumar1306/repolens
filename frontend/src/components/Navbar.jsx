import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function DarkModeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  const toggle = () => {
    const html = document.documentElement
    const nowDark = html.classList.toggle('dark')
    localStorage.setItem('theme', nowDark ? 'dark' : 'light')
    setIsDark(nowDark)
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-10 h-6 rounded-full transition-colors duration-300 focus:outline-none
        bg-gray-200 dark:bg-gray-700"
    >
      {/* Sliding circle */}
      <span
        className={`
          absolute top-1 left-1 w-4 h-4 rounded-full shadow-sm
          transition-all duration-300 flex items-center justify-center text-xs
          bg-white dark:bg-gray-900
          ${isDark ? 'translate-x-4' : 'translate-x-0'}
        `}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg hover:opacity-80 transition-opacity"
        >
          <span>🔍</span>
          <span>RepoLens</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">

          <DarkModeToggle />

          {user ? (
            <>
              <Link
                to="/history"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block"
              >
                History
              </Link>

              <div className="flex items-center gap-2">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user.username}
                </span>
              </div>

              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}