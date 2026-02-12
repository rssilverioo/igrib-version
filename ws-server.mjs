import { WebSocketServer } from "ws"

const PORT = process.env.WS_PORT || 3001

const wss = new WebSocketServer({ port: Number(PORT) })

// Map: negotiationId -> Set of WebSocket clients
const rooms = new Map()

wss.on("connection", (ws) => {
  let joinedRoom = null

  ws.on("message", (raw) => {
    let data
    try {
      data = JSON.parse(raw.toString())
    } catch {
      return
    }

    switch (data.type) {
      case "join": {
        const { negotiationId } = data
        if (!negotiationId) return

        // Leave previous room if any
        if (joinedRoom && rooms.has(joinedRoom)) {
          rooms.get(joinedRoom).delete(ws)
          if (rooms.get(joinedRoom).size === 0) rooms.delete(joinedRoom)
        }

        // Join new room
        if (!rooms.has(negotiationId)) {
          rooms.set(negotiationId, new Set())
        }
        rooms.get(negotiationId).add(ws)
        joinedRoom = negotiationId
        break
      }

      case "new_message": {
        // Broadcast message to all other clients in the same room
        if (!joinedRoom || !rooms.has(joinedRoom)) return

        const payload = JSON.stringify({
          type: "new_message",
          message: data.message,
        })

        for (const client of rooms.get(joinedRoom)) {
          if (client !== ws && client.readyState === 1) {
            client.send(payload)
          }
        }
        break
      }

      case "new_proposal": {
        if (!joinedRoom || !rooms.has(joinedRoom)) return

        const payload = JSON.stringify({
          type: "new_proposal",
          proposal: data.proposal,
          message: data.message,
        })

        for (const client of rooms.get(joinedRoom)) {
          if (client !== ws && client.readyState === 1) {
            client.send(payload)
          }
        }
        break
      }

      case "proposal_response": {
        if (!joinedRoom || !rooms.has(joinedRoom)) return

        const payload = JSON.stringify({
          type: "proposal_response",
          proposalId: data.proposalId,
          newStatus: data.newStatus,
          message: data.message,
          negotiationStatus: data.negotiationStatus,
          contract: data.contract,
        })

        for (const client of rooms.get(joinedRoom)) {
          if (client !== ws && client.readyState === 1) {
            client.send(payload)
          }
        }
        break
      }

      case "typing": {
        if (!joinedRoom || !rooms.has(joinedRoom)) return

        const payload = JSON.stringify({
          type: "typing",
          userId: data.userId,
          userName: data.userName,
        })

        for (const client of rooms.get(joinedRoom)) {
          if (client !== ws && client.readyState === 1) {
            client.send(payload)
          }
        }
        break
      }
    }
  })

  ws.on("close", () => {
    if (joinedRoom && rooms.has(joinedRoom)) {
      rooms.get(joinedRoom).delete(ws)
      if (rooms.get(joinedRoom).size === 0) rooms.delete(joinedRoom)
    }
  })
})

console.log(`WebSocket server running on ws://localhost:${PORT}`)
