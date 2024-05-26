const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Signaling Server is running.');
});

io.on('connection', socket => {
    console.log('A user connected.');

    // Handle offer from client
    socket.on('offer', offer => {
        // Broadcast offer to all other connected clients
        socket.broadcast.emit('offer', offer);
    });

    // Handle answer from client
    socket.on('answer', answer => {
        // Broadcast answer to all other connected clients
        socket.broadcast.emit('answer', answer);
    });

    // Handle ICE candidate from client
    socket.on('ice-candidate', candidate => {
        // Broadcast ICE candidate to all other connected clients
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

server.listen(PORT, () => {
    console.log(`Signaling Server is running on port ${PORT}`);
});
