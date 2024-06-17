const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {};

app.post('/create-room', (req, res) => {
    const roomId = uuidv4();
    rooms[roomId] = {
        id: roomId,
        players: [],
        scoreBoard: {},
    };
    res.json({ roomId });
});

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, roomId }) => {
        if (rooms[roomId]) {
            const player = { id: socket.id, username };
            rooms[roomId].players.push(player);
            rooms[roomId].scoreBoard[socket.id] = 0;
            socket.join(roomId);
            io.to(roomId).emit('updateRoomInfo', rooms[roomId]);
        }
    });

    socket.on('disconnect', () => {
        for (let roomId in rooms) {
            const room = rooms[roomId];
            room.players = room.players.filter(player => player.id !== socket.id);
            delete room.scoreBoard[socket.id];
            io.to(roomId).emit('updateRoomInfo', room);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
