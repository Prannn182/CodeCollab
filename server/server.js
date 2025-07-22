const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const RoomManager = require('./rooms');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const roomManager = new RoomManager();

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  const stats = roomManager.getAllRoomsStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeRooms: stats.length,
    totalConnections: io.engine.clientsCount,
    rooms: stats
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Emit a test event to verify client-server event delivery
  socket.emit('test-event', { message: 'Hello from server!' });

  let currentUser = null;
  let currentRoom = null;

  // Join or create room
  socket.on('join-room', ({ roomId, username, language = 'javascript' }) => {
    console.log(`[DEBUG] Received join-room request from ${socket.id}:`, { roomId, username, language });
    
    try {
      // Validate input
      if (!roomId || !username) {
        console.log(`[ERROR] Invalid join-room request from ${socket.id}: missing roomId or username`);
        socket.emit('error', { message: 'Room ID and username are required' });
        return;
      }

      // Clean room ID and username
      const cleanRoomId = roomId.trim().toLowerCase();
      const cleanUsername = username.trim();

      if (cleanUsername.length < 2 || cleanUsername.length > 20) {
        console.log(`[ERROR] Invalid username length from ${socket.id}: ${cleanUsername.length} characters`);
        socket.emit('error', { message: 'Username must be between 2 and 20 characters' });
        return;
      }

      console.log(`[DEBUG] Processing join-room for ${cleanUsername} to room ${cleanRoomId}`);

      // Create room if it doesn't exist
      if (!roomManager.roomExists(cleanRoomId)) {
        console.log(`[DEBUG] Creating new room: ${cleanRoomId}`);
        roomManager.createRoom(cleanRoomId, language);
      }

      // Add user to room
      const success = roomManager.addUser(cleanRoomId, socket.id, cleanUsername);
      if (!success) {
        console.log(`[ERROR] Failed to add user ${cleanUsername} to room ${cleanRoomId}`);
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // Join socket room
      socket.join(cleanRoomId);
      
      // Set current user and room
      currentUser = { id: socket.id, username: cleanUsername };
      currentRoom = cleanRoomId;

      // Get room data
      const room = roomManager.getRoom(cleanRoomId);
      
      console.log(`[DEBUG] Sending room-joined event to ${socket.id} for room ${cleanRoomId}`);
      
      // Send room data to user
      socket.emit('room-joined', {
        roomId: cleanRoomId,
        code: room.code,
        language: room.language,
        users: Array.from(room.users.values()),
        messages: room.messages
      });

      // Notify other users in room
      socket.to(cleanRoomId).emit('user-joined', {
        user: currentUser,
        userCount: room.users.size
      });

      console.log(`[SUCCESS] User ${cleanUsername} joined room ${cleanRoomId}`);
    } catch (error) {
      console.error('[ERROR] Error joining room:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Handle code changes
  socket.on('code-change', ({ code }) => {
    if (!currentRoom) return;

    try {
      // Update room code
      const success = roomManager.updateCode(currentRoom, code);
      if (success) {
        // Broadcast to other users in room
        socket.to(currentRoom).emit('code-updated', { code });
      }
    } catch (error) {
      console.error('Error updating code:', error);
    }
  });

  // Handle cursor updates
  socket.on('cursor-update', ({ cursor }) => {
    if (!currentRoom || !currentUser) return;

    try {
      // Update user cursor
      roomManager.updateCursor(currentRoom, socket.id, cursor);
      
      // Broadcast to other users in room
      socket.to(currentRoom).emit('cursor-updated', {
        userId: socket.id,
        username: currentUser.username,
        cursor: cursor
      });
    } catch (error) {
      console.error('Error updating cursor:', error);
    }
  });

  // Handle typing status
  socket.on('typing-start', () => {
    if (!currentRoom || !currentUser) return;

    try {
      roomManager.updateTypingStatus(currentRoom, socket.id, true);
      socket.to(currentRoom).emit('user-typing', {
        userId: socket.id,
        username: currentUser.username,
        isTyping: true
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  });

  socket.on('typing-stop', () => {
    if (!currentRoom || !currentUser) return;

    try {
      roomManager.updateTypingStatus(currentRoom, socket.id, false);
      socket.to(currentRoom).emit('user-typing', {
        userId: socket.id,
        username: currentUser.username,
        isTyping: false
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ message }) => {
    if (!currentRoom || !currentUser) return;

    try {
      // Validate message
      const cleanMessage = message.trim();
      if (cleanMessage.length === 0 || cleanMessage.length > 500) {
        socket.emit('error', { message: 'Message must be between 1 and 500 characters' });
        return;
      }

      // Add message to room
      const chatMessage = roomManager.addMessage(currentRoom, socket.id, currentUser.username, cleanMessage);
      
      if (chatMessage) {
        // Broadcast to all users in room (including sender)
        io.to(currentRoom).emit('chat-message', chatMessage);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle language changes
  socket.on('language-change', ({ language }) => {
    if (!currentRoom) return;

    try {
      const supportedLanguages = ['javascript', 'python', 'html', 'css', 'java', 'cpp'];
      if (!supportedLanguages.includes(language)) {
        socket.emit('error', { message: 'Unsupported language' });
        return;
      }

      // Update room language
      const success = roomManager.updateLanguage(currentRoom, language);
      if (success) {
        const room = roomManager.getRoom(currentRoom);
        
        // Broadcast to all users in room
        io.to(currentRoom).emit('language-updated', {
          language: language,
          code: room.code
        });
      }
    } catch (error) {
      console.error('Error changing language:', error);
      socket.emit('error', { message: 'Failed to change language' });
    }
  });

  // Handle code execution
  socket.on('run-code', async ({ code, language }) => {
    if (!currentRoom || !currentUser) return;
    try {
      let exec = require('child_process').exec;
      let command;
      let fileExtension;
      let fs = require('fs');
      let tmp = require('os').tmpdir();
      let filename;
      let cleanup = () => {};
      let timeout = 5000; // 5 seconds max
      let result = { output: '', error: '' };

      if (language === 'javascript') {
        command = `node -e "${code.replace(/"/g, '\"').replace(/\n/g, ' ')}"`;
      } else if (language === 'python') {
        fileExtension = '.py';
        filename = `${tmp}/codecollab_${socket.id}${fileExtension}`;
        fs.writeFileSync(filename, code);
        command = `python "${filename}"`;
        cleanup = () => { try { fs.unlinkSync(filename); } catch {} };
      } else {
        result.error = 'Language not supported for execution.';
        socket.emit('code-output', result);
        return;
      }

      exec(command, { timeout }, (err, stdout, stderr) => {
        cleanup();
        if (err) {
          result.error = stderr || err.message;
        } else {
          result.output = stdout;
        }
        // Emit to all users in the room
        io.to(currentRoom).emit('code-output', {
          userId: socket.id,
          username: currentUser.username,
          output: result.output,
          error: result.error,
          language,
        });
      });
    } catch (error) {
      socket.emit('code-output', { error: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (currentRoom && currentUser) {
      try {
        // Remove user from room
        roomManager.removeUser(currentRoom, socket.id);
        
        // Notify other users in room
        socket.to(currentRoom).emit('user-left', {
          userId: socket.id,
          username: currentUser.username
        });

        console.log(`User ${currentUser.username} left room ${currentRoom}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });

  // Handle room info request
  socket.on('get-room-info', () => {
    if (!currentRoom) return;

    try {
      const roomStats = roomManager.getRoomStats(currentRoom);
      if (roomStats) {
        socket.emit('room-info', roomStats);
      }
    } catch (error) {
      console.error('Error getting room info:', error);
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  roomManager.stopCleanupInterval();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  roomManager.stopCleanupInterval();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 CodeCollab server running on port ${PORT}`);
  console.log(`📊 Health endpoint: http://localhost:${PORT}/health`);
});