const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

server.listen(PORT, () => {
    console.log(`Signaling Server is running on port ${PORT}`);
});
io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('chat-message', (message) => {
        // Broadcast the chat message to other clients in the same call
        socket.broadcast.emit('chat-message', message);
    });

    // Other event handlers...

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

