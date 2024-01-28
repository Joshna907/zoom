const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server); // the server at last is there due to then socket.io will know how to interact
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res, next) => {
    res.redirect(`/${uuidv4()}`);
    next();  // this is like a unique identifier 
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
    // it is like when the person wants to go to the same location
    // it will pass the same unique id and they will go to the same location.
});

io.on('connection', (socket) => { 
    /* When a new client connects to the server, it will set up an event listener on the client's socket for the 'join-room' event.
       When the client emits ('sends') a 'join-room' event, then joined room user msg is displayed on the screen */
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId); // this will just join roomid 
        // it will show everyone that user-connected.
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });
});

server.listen(process.env.PORT||3456);
