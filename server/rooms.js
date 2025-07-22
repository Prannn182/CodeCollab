// Room management helper for CodeCollab
class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.cleanupInterval = null;
    this.startCleanupInterval();
  }

  // Create a new room
  createRoom(roomId, language = 'javascript') {
    const room = {
      id: roomId,
      code: this.getDefaultCode(language),
      language: language,
      users: new Map(),
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    this.rooms.set(roomId, room);
    console.log(`Room created: ${roomId}`);
    return room;
  }

  // Get room by ID
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Check if room exists
  roomExists(roomId) {
    return this.rooms.has(roomId);
  }

  // Add user to room
  addUser(roomId, userId, username) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.users.set(userId, {
      id: userId,
      username: username,
      cursor: null,
      isTyping: false,
      joinedAt: Date.now()
    });
    
    room.lastActivity = Date.now();
    return true;
  }

  // Remove user from room
  removeUser(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.users.delete(userId);
    room.lastActivity = Date.now();
    
    // If room is empty, mark for cleanup
    if (room.users.size === 0) {
      console.log(`Room ${roomId} is empty, will be cleaned up in 1 hour`);
    }
    
    return true;
  }

  // Update room code
  updateCode(roomId, code) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.code = code;
    room.lastActivity = Date.now();
    return true;
  }

  // Update room language
  updateLanguage(roomId, language) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.language = language;
    room.code = this.getDefaultCode(language);
    room.lastActivity = Date.now();
    return true;
  }

  // Add chat message
  addMessage(roomId, userId, username, message) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const chatMessage = {
      id: Date.now().toString(),
      userId: userId,
      username: username,
      message: message,
      timestamp: Date.now()
    };

    room.messages.push(chatMessage);
    room.lastActivity = Date.now();
    
    // Keep only last 100 messages
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }
    
    return chatMessage;
  }

  // Update user cursor
  updateCursor(roomId, userId, cursor) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const user = room.users.get(userId);
    if (!user) return false;

    user.cursor = cursor;
    room.lastActivity = Date.now();
    return true;
  }

  // Update user typing status
  updateTypingStatus(roomId, userId, isTyping) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const user = room.users.get(userId);
    if (!user) return false;

    user.isTyping = isTyping;
    room.lastActivity = Date.now();
    return true;
  }

  // Get room statistics
  getRoomStats(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    return {
      id: room.id,
      userCount: room.users.size,
      language: room.language,
      messageCount: room.messages.length,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity
    };
  }

  // Get all rooms statistics
  getAllRoomsStats() {
    const stats = [];
    for (const [roomId, room] of this.rooms) {
      stats.push({
        id: roomId,
        userCount: room.users.size,
        language: room.language,
        messageCount: room.messages.length,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity
      });
    }
    return stats;
  }

  // Cleanup stale rooms (empty for more than 1 hour)
  cleanupStaleRooms() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const roomsToDelete = [];

    for (const [roomId, room] of this.rooms) {
      if (room.users.size === 0 && (now - room.lastActivity) > oneHour) {
        roomsToDelete.push(roomId);
      }
    }

    roomsToDelete.forEach(roomId => {
      this.rooms.delete(roomId);
      console.log(`Cleaned up stale room: ${roomId}`);
    });

    return roomsToDelete.length;
  }

  // Start cleanup interval (runs every 30 minutes)
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      const cleanedCount = this.cleanupStaleRooms();
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} stale rooms`);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Stop cleanup interval
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get default code for language
  getDefaultCode(language) {
    const defaults = {
      javascript: `// Welcome to CodeCollab!
// Start coding with your team in real-time

function helloWorld() {
  console.log("Hello, CodeCollab!");
}

helloWorld();`,
      python: `# Welcome to CodeCollab!
# Start coding with your team in real-time

def hello_world():
    print("Hello, CodeCollab!")

hello_world()`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCollab</title>
</head>
<body>
    <h1>Welcome to CodeCollab!</h1>
    <p>Start coding with your team in real-time</p>
</body>
</html>`,
      css: `/* Welcome to CodeCollab! */
/* Start coding with your team in real-time */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    text-align: center;
}`,
      java: `// Welcome to CodeCollab!
// Start coding with your team in real-time

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, CodeCollab!");
    }
}`,
      cpp: `// Welcome to CodeCollab!
// Start coding with your team in real-time

#include <iostream>

int main() {
    std::cout << "Hello, CodeCollab!" << std::endl;
    return 0;
}`
    };

    return defaults[language] || defaults.javascript;
  }
}

module.exports = RoomManager; 