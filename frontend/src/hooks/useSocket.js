import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(jobId) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [docs, setDocs] = useState({})
  const [jobDone, setJobDone] = useState(false)
  const [jobError, setJobError] = useState(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    if (!jobId) return

    // Socket connects directly to Render (WebSockets can't be proxied through Vercel)
    // Only REST API calls go through the Vercel proxy
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('Socket connected:', socket.id)
      socket.emit('join', { jobId })
    })

    socket.on('joined', ({ jobId: confirmedJobId }) => {
      console.log('Joined job room:', confirmedJobId)
    })

    socket.on('job:status', (data) => {
      setMessages((prev) => [...prev, { type: 'status', ...data, time: Date.now() }])
    })

    socket.on('job:rateLimit', (data) => {
      setMessages((prev) => [...prev, { type: 'rateLimit', ...data, time: Date.now() }])
    })

    socket.on('job:docComplete', (data) => {
      setDocs((prev) => ({ ...prev, [data.type]: data.content }))
      setMessages((prev) => [...prev, {
        type: 'docComplete',
        message: `Generated: ${data.type}`,
        docType: data.type,
        time: Date.now(),
      }])
    })

    socket.on('job:done', (data) => {
      setJobDone(true)
      setMessages((prev) => [...prev, {
        type: 'done',
        message: 'All documents generated!',
        time: Date.now(),
      }])
    })

    socket.on('job:cached', (data) => {
      setCached(true)
      setJobDone(true)
      setMessages((prev) => [...prev, {
        type: 'cached',
        message: data.message || 'Loaded from cache — docs ready instantly!',
        time: Date.now(),
      }])
    })

    socket.on('job:error', (data) => {
      setJobError(data.message)
      setMessages((prev) => [...prev, {
        type: 'error',
        message: data.message,
        time: Date.now(),
      }])
    })

    socket.on('disconnect', () => {
      setConnected(false)
      console.log('Socket disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [jobId])

  return {
    socket: socketRef.current,
    connected,
    messages,
    docs,
    jobDone,
    jobError,
    cached,
  }
}