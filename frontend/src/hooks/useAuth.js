import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (_) {}
    setUser(null);
  };

  return { user, loading, logout };
}