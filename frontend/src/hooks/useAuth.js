import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        const raw = res.data;
        // Normalise field names — backend might return GitHub snake_case or Prisma camelCase
        const normalised = {
          ...raw,
          username:  raw.username  || raw.login       || raw.name || 'user',
          avatarUrl: raw.avatarUrl || raw.avatar_url  || raw.avatarURL || '',
        };
        setUser(normalised);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try { await api.get('/auth/logout'); } catch (_) {}
    setUser(null);
  };

  return { user, loading, logout };
}