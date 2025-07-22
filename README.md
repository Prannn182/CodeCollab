# CodeCollab - Real-time Collaborative Code Editor

A modern, real-time collaborative code editor web app built with React, Node.js, and Socket.IO. Features a beautiful, responsive UI with advanced collaboration features.

## ✨ Features

- **🎨 Modern UI/UX** - Beautiful gradient design with glass morphism effects
- **⚡ Real-time collaborative code editing** - Multiple users can edit code simultaneously
- **👥 Live user cursor tracking** - See where other users are typing in real-time
- **🌐 Language syntax switching** - Support for JavaScript, Python, HTML, CSS, Java, and C++
- **🏠 Room sharing** - Join or create rooms with unique IDs
- **💬 In-room chat messaging** - Communicate with other users in the room
- **⌨️ Typing indicators** - See when others are typing
- **🔄 Auto-cleanup** - Stale rooms are automatically cleaned up
- **📱 Responsive design** - Works on desktop and mobile devices
- **🎯 Enhanced animations** - Smooth transitions and micro-interactions
- **🔔 Real-time notifications** - Stay informed about room activities

## 🛠️ Tech Stack

- **Frontend**: React 18, CodeMirror 6, TailwindCSS, Socket.IO-client
- **Backend**: Node.js, Express, Socket.IO
- **Storage**: In-memory Map for room state
- **Styling**: TailwindCSS with custom gradients and animations
- **Fonts**: Inter (UI) + JetBrains Mono (Code)

## 📁 Project Structure

```
codecollab/
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx      # Code editor with syntax highlighting
│   │   │   ├── Chat.jsx        # Real-time chat component
│   │   │   ├── Sidebar.jsx     # User list and status
│   │   │   ├── RoomJoin.jsx    # Room joining interface
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # React entry point
│   │   ├── socket.js           # Socket.IO client manager
│   │   └── index.css           # Global styles and animations
│   ├── index.html
│   └── vite.config.js
├── server/               # Node backend
│   ├── server.js         # Express server with Socket.IO
│   ├── rooms.js          # Room management logic
│   └── package.json
├── install.bat           # Windows installation script
├── install.sh            # Unix/Linux installation script
├── README.md
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

#### Option 1: Automated Installation (Recommended)

**Windows:**
```bash
install.bat
```

**Unix/Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

#### Option 2: Manual Installation

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Start Both Servers (Recommended)
```bash
npm run dev
```

#### Option 2: Start Servers Separately

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:3002`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🎯 How to Use

### 1. Create or Join a Room
- Enter a room ID and your username
- Choose your preferred programming language
- Click "Join Room" or generate a random room ID

### 2. Start Coding
- Write code in the editor with real-time syntax highlighting
- See live updates from other users as they type
- Track cursor movements of other participants
- Switch between different programming languages

### 3. Collaborate with Others
- Use the chat panel to communicate with team members
- See typing indicators when others are typing
- View user status and activity in the sidebar
- Share the room ID with others to invite them

### 4. Advanced Features
- **Language Switching**: Change syntax highlighting for all users
- **Cursor Tracking**: See where other users are editing
- **Typing Indicators**: Know when someone is typing
- **Auto-save**: Code is automatically saved in the room

## 🎨 UI Features

### Modern Design
- **Glass Morphism**: Translucent backgrounds with blur effects
- **Gradient Accents**: Beautiful color gradients throughout the interface
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive Layout**: Works on all screen sizes

### Enhanced Components
- **Smart Language Selector**: Visual language cards with icons
- **User Avatars**: Gradient avatars with status indicators
- **Message Bubbles**: Modern chat interface with timestamps
- **Status Indicators**: Real-time connection and typing status

## 🔧 API Endpoints

- `GET /health` - Server health status and room information
- WebSocket events for real-time communication

### WebSocket Events

**Client to Server:**
- `join-room` - Join or create a room
- `code-change` - Send code updates
- `cursor-update` - Send cursor position
- `typing-start/stop` - Typing indicators
- `chat-message` - Send chat messages
- `language-change` - Change programming language

**Server to Client:**
- `room-joined` - Confirmation of room join
- `user-joined/left` - User presence updates
- `code-updated` - Code changes from other users
- `cursor-updated` - Cursor positions from other users
- `chat-message` - New chat messages
- `language-updated` - Language changes

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the `dist` folder
```

### Backend (Render/Fly.io)
```bash
cd server
# Deploy the server folder
# Ensure WebSocket support is enabled
```

### Environment Variables
- `VITE_SERVER_URL` - Backend server URL (default: http://localhost:3002)
- `PORT` - Backend server port (default: 3002)

## 🛡️ Security Features

- Input validation and sanitization
- Rate limiting on chat messages
- Room cleanup for inactive sessions
- Secure WebSocket connections

## 🔄 Room Management

- **Auto-cleanup**: Empty rooms are cleaned up after 1 hour
- **Message History**: Last 100 messages are preserved per room
- **User Limits**: No hard limit on users per room
- **Session Persistence**: Code and chat history maintained during session

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) for the excellent code editor
- [Socket.IO](https://socket.io/) for real-time communication
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React](https://reactjs.org/) for the component-based architecture

---

**Made with ❤️ for collaborative coding** 