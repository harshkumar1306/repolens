import axios from 'axios'

// All API calls go through this client — it automatically sends cookies
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true, // Required for session cookies
})

export default api