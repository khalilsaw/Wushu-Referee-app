const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const { emit } = require('process');
const server = http.createServer(app);
const io = require('socket.io')(server);

let rooms = [];
const users = new Map();
const referees = {};

app.use('/img/', express.static(path.join(__dirname, 'img')));
app.use('/socket.io', express.static(path.join(__dirname, 'socket.io')));
app.use('/sound', express.static(path.join(__dirname, 'sound')));
app.use('/css', express.static(path.join(__dirname, 'css')));

io.on('connection', (socket) => {
  // store rooms
  socket.on('generated-room-stored', (roomid) => {
    rooms.push(roomid);
    console.log('rooms from server : ' + rooms);
  });

  //--------------------------------------------------------------------------

  //check rooms
  let adminsCount = 0;
  let arbitresCount = 0;

  let round_spec_use = 0;

  socket.on('check-room', ({ username, role, roomid }, callback) => {
    const roomExists = rooms.includes(roomid);
    if (!roomExists) {
      console.log('Room does not exist yet...');
      callback({ exists: false });
    }

    if (!users.has(roomid)) {
      users.set(roomid, []);
    }

    if (users.has(roomid)) {
      const usersInRoom = users.get(roomid);
      console.log(' hey badr ' + usersInRoom);
      for (const user of usersInRoom) {
        if (user.role === 'admin') {
          adminsCount++;
        } else if (user.role === 'arbitre') {
          arbitresCount++;
        }
      }
      console.log(
        `In room ${roomid}, there are ${adminsCount} admin(s) and ${arbitresCount} arbitre(s).`
      );
    } else {
      console.log(`Room ${roomid} not found in users map`);
    }

    if (role === 'admin' && adminsCount >= 1) {
      console.log(`Admin already exists in room ${roomid}`);
      callback({ exists: false });
    } else if (role === 'arbitre' && arbitresCount >= 5) {
      console.log(`Maximum number of arbitres reached in room ${roomid}`);
      callback({ exists: false });
    } else {
      console.log(`Room ${roomid} exists and requirements met`);

      callback({ exists: true });
    }
  });

  //---------------------------------------------

  // when a user gets connected
  socket.on('login', ({ username, role, roomid }) => {
    // Check whether the room exists
    const roomExists = rooms.includes(roomid);
    if (!roomExists) {
      console.log(`Room ${roomid} does not exist`);
      // Redirect the user to an error page
      return;
    }

    // Check whether the max number of admins or arbiters has been reached
    if (role === 'admin' && adminsCount >= 1) {
      console.log('Admin already exists in room', roomid);
      // Redirect the user to an error page
      return;
    } else if (role === 'arbitre' && arbitresCount >= 5) {
      console.log('Max number of arbiters reached in room', roomid);
      // Redirect the user to an error page
      return;
    }

    // Add the user to the users map
    const user = { name: username, role: role, room: roomid };
    if (role === 'arbitre') {
      if (!referees[roomid]) {
        // if there are no referees for this room yet
        referees[roomid] = []; // create an empty array for this room
      }
      if (referees[roomid].includes(username)) {
        // referee is already in the array for this room
        console.log('Referee already exists in the room');
        return;
      }

      referees[roomid].push(username); // add the referee to the array for this room
      user.rounds = [null, null, null];
      console.dir(referees);
    }

    const usersInRoom = users.get(roomid) || [];
    usersInRoom.push(user);
    users.set(roomid, usersInRoom);
    console.log(`User ${username} added to the users map `);
    console.log('this is the new map');
    console.dir(users);

    // Add the user to the specified room
    socket.join(roomid);

    // Broadcast a message to all connected users in the room
    io.to(roomid).emit(
      'message',
      `${username} (${role}) has joined the chat in room ${roomid}`
    );

    //666666666666666666666666666666666666666666666666666
    //666666666666666666666666666666666666666666666666666
    //send referees
    socket.on('fill-the-tv', () => {
      io.to(roomid).emit('arbitre-to-tv', referees[roomid]);
    });
    //666666666666666666666666666666666666666666666666666
    socket.on('change-round-value', ({ player, round }) => {
      const arbitreUsers = users
        .get(roomid)
        .filter((user) => user.role === 'arbitre');
      arbitreUsers.forEach((arbitre) => {
        const index = round - 1;
        if (index === -1) {
          index = 0;
        }
        console.log(index + ' : round');
        arbitre.rounds[index] = player;
        /* arbitre.rounds[index] = player; */
      });
    });

    socket.on('rounds-winner', () => {
      // Find all arbitre users and store their rounds in an object
      const arbitreUsers = users
        .get(roomid)
        .filter((user) => user.role === 'arbitre');
      const resultRounds = {
        [roomid]: arbitreUsers.map((user) => user.rounds),
      };

      // Output the result
      console.log('arbitreRounds');
      console.log(resultRounds);

      // determine how many rounds to submit based on the current round
      const numRoundsToSubmit = round_spec_use;

      const roundWinners = []; // an array to store the winner for each round
      let winner;
      // loop through each round
      for (let i = 0; i < numRoundsToSubmit; i++) {
        let player1Wins = 0;
        let player2Wins = 0;

        // loop through each arbiter
        for (let j = 0; j < resultRounds[roomid].length; j++) {
          const result = resultRounds[roomid][j][i];
          if (result === 'player1') {
            player1Wins++;
          } else if (result === 'player2') {
            player2Wins++;
          }
        }

        // determine the winner of the round based on the number of wins

        if (player1Wins > player2Wins) {
          winner = 'player1';
          //emit to the tv to increment the winner blue
        } else if (player2Wins > player1Wins) {
          winner = 'player2';
          //emit to the tv to increment the winner blue
        } else {
          winner = 'equal';
        }

        // store the round's winner as an object with a round number and winner key
        roundWinners.push(winner);
        console.log('hey im the array list : ' + roundWinners);
      }

      // submit null for the remaining rounds if necessary
      if (numRoundsToSubmit < 3) {
        for (let i = numRoundsToSubmit; i < 3; i++) {
          roundWinners.push(null);
        }
      }

      if (winner == 'player1') {
        io.to(roomid).emit('increment-winR', 'blue');
        console.log('hey im the increment pl blue');
      } else if (winner == 'player2') {
        io.to(roomid).emit('increment-winR', 'red');
        console.log('hey im the increment pl red');
      }

      io.to(roomid).emit('rounds-winner-result', roundWinners);

      // print the winners for each round
      for (let i = 0; i < roundWinners.length; i++) {
        const winner = roundWinners[i];
        console.log(
          `Round ${i + 1}: ${winner ? `${winner} wins!` : 'No winner yet'}`
        );
      }
    });

    //666666666666666666666666666666666666666666666666666

    // Assuming you have already set up a socket.io server connection
    socket.on('updatePlayerValue', function (data) {
      const playertoup = data.player;
      const arbitrerNa = data.username;
      io.to(roomid).emit('updatePlayerValue-to-tv', { playertoup, arbitrerNa });
      // Log the username of the arbiter and the updated player value
      console.log(
        `Arbiter ${data.username} updated ${data.player} to ${data.value}`
      );
    });

    socket.on('updatePlayerValue-dec', function (data) {
      const playertoup = data.player;
      const arbitrerNa = data.username;

      io.to(roomid).emit('updatePlayerValue-to-tv-dec', {
        playertoup,
        arbitrerNa,
      });
      // Log the username of the arbiter and the updated player value
      console.log(
        `Arbiter ${data.username} updated ${data.player} to ${data.value}`
      );
    });

    //listen to sended values from arbitre

    socket.on('send-value', (value, roomid) => {
      console.log(
        'Value of arbitre received from server : ' + JSON.stringify(value)
      );

      const round = value.round;
      const arbitreName = value.arbitre;
      const winner = value.winner;

      console.log(
        round +
          ' ' +
          arbitreName +
          ' ' +
          winner +
          ' from the server from send-value'
      );

      function isArbitratorResultSubmitted(
        users,
        roomId,
        roundNumber,
        arbitratorName
      ) {
        const arbitrators = users
          .get(roomId)
          .filter((user) => user.role === 'arbitre');
        const submitted = arbitrators.some(
          (arbitrator) =>
            arbitrator.name === arbitratorName &&
            arbitrator.rounds[roundNumber - 1] !== null
        );
        return submitted;
      }

      const resultSubmitted = isArbitratorResultSubmitted(
        users,
        roomid,
        round,
        arbitreName
      );
      console.log(
        `hey this is the indice if the arbitre already submited ${resultSubmitted}`
      );
      if (resultSubmitted) {
        return;
      }

      const usersInRoom = users.get(roomid);

      // find the arbitre in the users map and check if they have already submitted a winner for the round
      const arbitre = usersInRoom.find(
        (user) => user.role === 'arbitre' && user.name === arbitreName
      );
      if (!arbitre.rounds[round - 1]) {
        // store the winner for the round in the arbitre's rounds array
        arbitre.rounds[round - 1] = winner;
        console.log(
          `Winner ${winner} submitted for round ${round} by arbitre ${arbitreName} in room ${roomid}`
        );
      } else {
        console.log(
          `Arbitre ${arbitreName} already submitted a winner for round ${round} in room ${roomid}`
        );
      }

      io.to(roomid).emit('receive-values', {
        round,
        arbitreName,
        winner,
        roomid,
      });
      console.log(users);
    });

    // Listen for the 'select-round' event
    socket.on('select-round', (round) => {
      round_spec_use = round;
      console.log(`Admin selected round ${round}`);

      // Emit an event to the arbitre client with the selected round value
      io.to(roomid).emit('selected-round', round);
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

    socket.on('out-card', (player) => {
      
      io.to(roomid).emit('out-card', player);
      io.to(roomid).emit('out-card-zero-arbitre');
    });
    /* socket.on('outcard', (winnercolor) => {
      console.log('out card service ' + winnercolor);
      io.to(roomid).emit('outcardV2', winnercolor);
    }); */

    socket.on('disconnect', () => {
      const usersInRoom = users.get(user.room);
      const disconnectedUser = usersInRoom.find(
        (user) => user.name === username
      );

      if (disconnectedUser) {
        if (disconnectedUser.role === 'arbitre') {
          arbitresCount--;

          const index = referees[roomid].indexOf(username);
          if (index !== -1) {
            io.to(roomid).emit('arbitre-deleted', username);
            console.log('hey you want to see the index ::::::: ' + index);
            referees[roomid].splice(index, 1);
          }
          console.log(
            `Arbitrator ${username} disconnected. ${arbitresCount} arbitrators remaining.`
          );
        } else if (disconnectedUser.role === 'admin') {
          adminsCount--;
          console.log(
            `Admin ${username} disconnected. ${adminsCount} admins remaining.`
          );
        } else {
          console.log(`User ${username} disconnected.`);
        }

        const index = usersInRoom.indexOf(disconnectedUser);
        usersInRoom.splice(index, 1);

        // If no more users in the room, delete the room from the users Map
        if (usersInRoom.length === 0) {
          users.delete(user.room);
        }

        // Leave the room the user joined
        socket.leave(disconnectedUser.roomid);
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
