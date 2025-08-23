const WebSocket = require('ws');

let wss;
const boardConnections = new Map(); // Map<boardId, Set<WebSocket>>
const userConnections = new Map();  // Map<userId, Set<WebSocket>>

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // ✅ Join board room
        if (data.type === 'JOIN_BOARD') {
          const { boardId } = data.payload;
          if (!boardConnections.has(boardId)) {
            boardConnections.set(boardId, new Set());
          }
          boardConnections.get(boardId).add(ws);
          ws.boardId = boardId; // Associate ws with boardId
        }

        // ✅ Join user room (for invitations / notifications)
        if (data.type === 'JOIN_USER') {
          const { userId } = data.payload;
          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set());
          }
          userConnections.get(userId).add(ws);
          ws.userId = userId; // Associate ws with userId
        }
      } catch (error) {
        console.error('Failed to parse message or handle client join:', error);
      }
    });

    ws.on('close', () => {
      // Clean up board connections
      if (ws.boardId && boardConnections.has(ws.boardId)) {
        boardConnections.get(ws.boardId).delete(ws);
        if (boardConnections.get(ws.boardId).size === 0) {
          boardConnections.delete(ws.boardId);
        }
      }
      // Clean up user connections
      if (ws.userId && userConnections.has(ws.userId)) {
        userConnections.get(ws.userId).delete(ws);
        if (userConnections.get(ws.userId).size === 0) {
          userConnections.delete(ws.userId);
        }
      }
    });
  });

  console.log('WebSocket Server Initialized');
};

// ✅ Broadcast to all members of a board
const broadcast = (boardId, message) => {
  if (boardConnections.has(boardId)) {
    const clients = boardConnections.get(boardId);
    const stringifiedMessage = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stringifiedMessage);
      }
    });
  }
};

// ✅ Send a message directly to a user (for invitations, alerts, etc.)
const notifyUser = (userId, message) => {
  if (userConnections.has(String(userId))) {
    const clients = userConnections.get(String(userId));
    const stringifiedMessage = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stringifiedMessage);
      }
    });
  }
};

module.exports = { initializeWebSocket, broadcast, notifyUser };
