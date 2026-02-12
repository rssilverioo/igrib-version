"use client"

import { useEffect, useRef, useCallback } from "react"

type WSMessage = {
  type: string
  [key: string]: unknown
}

type UseWebSocketOptions = {
  negotiationId: string
  onMessage: (data: WSMessage) => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"

export function useWebSocket({ negotiationId, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", negotiationId }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessageRef.current(data)
      } catch {
        // ignore invalid messages
      }
    }

    ws.onclose = () => {
      wsRef.current = null
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [negotiationId])

  const send = useCallback((data: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}
