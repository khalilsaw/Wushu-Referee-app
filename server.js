const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const arbitreRole = 'arbitre';

let rooms = [];
const users = new Map();

let numConnectedArbitr = 0; // Counter variable to track the number of connected arbitr
let numConnectedAdmin = 0; // Counter variable to track the number of connected admin clients

app.use('/img/', express.static(path.join(__dirname, 'img')));
app.use('/socket.io', express.static(path.join(__dirname, 'socket.io')));
app.use('/sound', express.static(path.join(__dirname, 'sound')));
app.use('/css', express.static(path.join(__dirname, 'css')));

io.on('connection', (socket) => {
  // Declare the values object for this connection
  let values = {}; // object to store the values for each arbitre

  let updatedValues = {
    1: [],
    2: [],
    3: [],
  };

  // store rooms
  socket.on('generated-room-stored', (roomid) => {
    rooms.push(roomid);
  });

  //6--------------------------------------------------------------------------
  function countRoles(usersMap) {
    let adminCount = 0;
    let arbitreCount = 0;

    for (const user of usersMap.values()) {
      if (user.role === 'admin') {
        adminCount++;
      } else if (user.role === 'arbitre') {
        arbitreCount++;
      }
    }

    return { adminCount, arbitreCount };
  }

  socket.on('check-room', ({ roomid, role }, callback) => {
    // Check whether the room exists
    // Your code for checking the room can go here
    const roomExists = rooms.includes(roomid); // set this variable to true or false based on your check
    // Count the number of arbitres
    const { adminCount } = countRoles(users);
    const { arbitreCount } = countRoles(users);
    console.log(
      roomExists + ' ' + role + ' ' + adminCount + ' ' + arbitreCount
    );

    if (role == 'admin' && adminCount == 1) {
      console.log('admin already exist');
      callback({ exists: false });
      return;
    }

    if (role == 'arbitre' && arbitreCount >= 5) {
      console.log('arbitre max reaced');
      callback({ exists: false });
      return;
    }
    callback({ exists: roomExists });
  });

  //---------------------------------------------
  // when a user gets connected
  socket.on('login', ({ username, role, roomid }) => {
    console.log(
      `${username} connected to server as ${role} in room ${roomid} //////// ${socket.id}`
    );

    console.log(users);

    const roomExists = rooms.includes(roomid);
    const { adminCount } = countRoles(users);
    const { arbitreCount } = countRoles(users);

    //if the room doesn't exist
    if (!roomExists) {
      return;
    }

    //the role verifications
    if (role == 'admin' && adminCount == 1) {
      console.log('admin already exist');
      return;
    } else if (role == 'arbitre' && arbitreCount >= 5) {
      console.log('arbitre max reaced');
      return;
    }

    // Add the user to the specified room
    socket.join(roomid);

    // Store the user's details and socket ID in the map
    users.set(username, { id: socket.id, role, roomid });

    // Broadcast a message to all connected users in the room
    io.to(roomid).emit(
      'message',
      `${username} (${role}) has joined the chat in room ${roomid}`
    );

    socket.on('send-value', (value, roomid) => {
      console.log('Value received: ' + JSON.stringify(value));

      const round = value.round;
      const arbitreName = value.arbitre;
      const winner = value.winner;
      console.log(
        round + ' ' + arbitreName + ' ' + winner + ' from the server'
      );

      io.to(roomid).emit('receive-values', { round, arbitreName, winner });
    });

    //redirection code  for timer

    socket.on('start-timer-admin', () => {
      console.log('timer in server changed');
      io.to(roomid).emit('start-timer');
    });

    socket.on('pause-timer-admin', () => {
      console.log('timer in server changed');
      io.to(roomid).emit('pause-timer');
    });
    socket.on('restart-timer-admin', () => {
      console.log('timer in server changed');
      io.to(roomid).emit('restart-timer');
    });

    // Listen for the 'select-round' event
    socket.on('select-round', (round) => {
      console.log(`Admin selected round ${round}`);

      // Update the values object with the selected round
      values = {
        1: round === '1' ? values[1] : values[1],
        2: round === '2' ? values[2] : values[2],
        3: round === '3' ? values[3] : values[3],
      };

      // Emit an event to the arbitre client with the selected round value

      io.to(roomid).emit('selected-round', round);
    });

    //redirect url to winner

    socket.on('redirect-player-to-tv', (url3) => {
      io.to(roomid).emit('redirect-player-to-tv-from-server', url3);
      console.log(url3);
    });

    socket.on('redirect-tv-to-winner', (url) => {
      io.to(roomid).emit('redirect-tv-to-winner-from-server', url);
      console.log(url);
    });

    socket.on('redirect-tv-to-players', (url2) => {
      io.to(roomid).emit('redirect-tv-to-players-from-server', url2);
      console.log(url2);
    });

    //outcard event
    socket.on('outcard', (winnercolor) => {
      console.log('out card service ' + winnercolor);
      io.to(roomid).emit('outcardV2', winnercolor);
    });

    socket.on('disconnect', () => {
      const user = users.get(username);
      console.log(user);
      if (user) {
        if (user.role === arbitreRole) {
          numConnectedArbitr--;
          console.log(
            `Arbitrator ${user.id} disconnected. ${numConnectedArbitr} arbitrators remaining.`
          );
        } else if (user.role === 'admin') {
          numConnectedAdmin--;
          console.log(
            `Admin ${user.id} disconnected. ${numConnectedAdmin} admins remaining.`
          );
        } else {
          console.log(`User ${user.id} disconnected.`);
        }

        users.delete(username);

        // Leave the room the user joined
        socket.leave(user.roomid);
      }
    });
  });
});

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
