#!/bin/bash

echo "========================================"
echo "   CodeCollab Installation Script"
echo "========================================"
echo

echo "Installing dependencies..."
echo

echo "Installing root dependencies..."
npm install

echo
echo "Installing server dependencies..."
cd server
npm install
cd ..

echo
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo
echo "========================================"
echo "   Installation Complete!"
echo "========================================"
echo
echo "To start the application:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:5173"
echo
echo "Or start manually:"
echo "- Server: cd server && npm start"
echo "- Client: cd client && npm run dev"
echo 