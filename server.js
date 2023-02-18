const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const adminRole = 'admin';
const arbitreRole = 'arbitre';

let values = {
  1: [],
  2: [],
  3: []
};
let rooms = [];
const users = new Map();


let numConnectedArbitr = 0; // Counter variable to track the number of connected arbitr
const maxConnections = 5;
let numConnectedAdmin = 0; // Counter variable to track the number of connected admin clients
const maxAdminConnections = 1; // Maximum number of connections for admin clients



let updatedValues = {
  1: [],
  2: [],
  3: []
};

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/socket.io', express.static(path.join(__dirname,'socket.io')));
app.use('/sound', express.static(path.join(__dirname, 'sound')));
app.use('/css', express.static(path.join(__dirname, 'css')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:username/:role/:roomid', (req, res) => {
  const { username, role, roomid } = req.params;
  switch (role) {
    case 'admin':
      res.sendFile(path.join(__dirname, 'admin.html'));
      break;
    case 'arbitre':
      res.sendFile(path.join(__dirname, 'arbitre.html'));
      break;
    case 'tv':
      res.sendFile(path.join(__dirname, 'tv.html'));
      break;
    case 'winner':
      res.sendFile(path.join(__dirname, 'winner.html'));
      break;
    case 'tvplayers':
      res.sendFile(path.join(__dirname, 'tvplayers.html'));
      break;
    default:
      res.status(404).send('Invalid role specified');
      break;
  }
});




io.on('connection', (socket) => {
    //check rooms
    socket.on('check-room', ({ roomid, role }, callback) => {
      // Check whether the room exists
      // Your code for checking the room can go here
      const roomExists = rooms.includes(roomid); // set this variable to true or false based on your check
      callback({ exists: roomExists });
    });

    //store rooms
    socket.on('generated-room-stored',(roomid)=>{
      rooms.push(roomid);
    });

    //when a user gets connected 
    socket.on('login', ({ username, role, roomid }) => {
      console.log(`${username} connected to server as ${role} in room ${roomid} //////// ${socket.id}`);
      // Add the user to the specified room
      socket.join(roomid);
      // Store the user's details and socket ID in the map
      users.set(username, { id: socket.id, role, roomid });
      // Broadcast a message to all connected users in the room
      io.to(roomid).emit('message', `${username} (${role}) has joined the chat in room ${roomid}`);
    });
    // When a user disconnects, remove their details from the map and broadcast a message to other users in the room
    socket.on('disconnect', () => {
      for (let [key, value] of users) {
        if (value.id === socket.id) {
          const { roomid, role } = value;
          users.delete(key);
          io.to(roomid).emit('message', `${key} (${role}) has left the chat in room ${roomid}`);
          break;
        }
      }
    });
     
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


