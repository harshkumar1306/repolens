import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

/**
 * Connects to the backend Socket.io server and joins a job room.
 * Returns the socket instance and a log of all received messages.
 *
 * Usage:
 *   const { messages, connected } = useSocket(jobId)
 */
export function useSocket(jobId) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [docs, setDocs] = useState({})       // { OVERVIEW: '...', SPEC: '...' }
  const [jobDone, setJobDone] = useState(false)
  const [jobError, setJobError] = useState(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    if (!jobId) return

    // Connect to backend
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('Socket connected:', socket.id)

      // Join the room for this specific job
      socket.emit('join', { jobId })
    })

    socket.on('joined', ({ jobId: confirmedJobId }) => {
      console.log('Joined job room:', confirmedJobId)
    })

    // Status updates (progress messages)
    socket.on('job:status', (data) => {
      setMessages((prev) => [...prev, { type: 'status', ...data, time: Date.now() }])
    })

    // Rate limit pause notification
    socket.on('job:rateLimit', (data) => {
      setMessages((prev) => [...prev, { type: 'rateLimit', ...data, time: Date.now() }])
    })

    // A single document finished generating
    socket.on('job:docComplete', (data) => {
      setDocs((prev) => ({ ...prev, [data.type]: data.content }))
      setMessages((prev) => [...prev, {
        type: 'docComplete',
        message: `Generated: ${data.type}`,
        docType: data.type,
        time: Date.now(),
      }])
    })

    // All documents done
    socket.on('job:done', (data) => {
      setJobDone(true)
      setMessages((prev) => [...prev, {
        type: 'done',
        message: 'All documents generated!',
        time: Date.now(),
      }])
    })

    // Loaded from cache
    socket.on('job:cached', (data) => {
      setCached(true)
      setJobDone(true)
      setMessages((prev) => [...prev, {
        type: 'cached',
        message: data.message || 'Loaded from cache — docs ready instantly!',
        time: Date.now(),
      }])
    })

    // Job failed
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

    // Cleanup when component unmounts or jobId changes
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