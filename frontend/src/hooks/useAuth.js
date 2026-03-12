import { useState, useEffect } from 'react'
import api from '../lib/api'

// Fetches the current logged-in user from the backend session
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.get('/auth/logout')
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, logout }
}