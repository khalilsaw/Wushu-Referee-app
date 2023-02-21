console.log(
  `The login event ; ${username} connected to server as ${role} in room ${roomid} //////// ${socket.id}`
);

const roomExists = rooms.includes(roomid);
if (!roomExists) {
  console.log(` login is checking the room and it didnt find it `);
  return;
}

const adminCount = countRoles(users, 'admin', roomid);
const arbitreCount = countRoles(users, 'arbitre', roomid);

console.log(
  `arbitre and admin count from the login : ${adminCount} ${arbitreCount}`
);

//the role verifications
if (role == 'admin' && adminCount == 1) {
  console.log('admin already exists from the login');
  return;
} else if (role == 'arbitre' && arbitreCount >= 5) {
  console.log('arbitre max reached from the login');
  return;
}

// Add the user to the specified room
socket.join(roomid);

// Store the user's details and socket ID in the map
users.set(`$${roomid}`, { id: socket.id, role, roomid });
console.log(`User join the socket and beeing added to the users map ${users}`);

socket.on('send-value', (value, roomid) => {
  console.log(
    'Value of arbitre received from server : ' + JSON.stringify(value)
  );

  //get me the data in value in console log

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

  io.to(roomid).emit('receive-values', {
    round,
    arbitreName,
    winner,
    roomid,
  });
  console.log(users);
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
  values[roomid] = {
    1: round === '1' ? values[roomid]?.[1] : values[roomid]?.[1],
    2: round === '2' ? values[roomid]?.[2] : values[roomid]?.[2],
    3: round === '3' ? values[roomid]?.[3] : values[roomid]?.[3],
  };

  // Emit an event to the arbitre client with the selected round value

  io.to(roomid).emit('selected-round', round);
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

//JTLP-XLJW
//////Testing code :
/* function calculateRoundWinners(values) {
        let roundWinners = [];
        let roundWinnersByRound = { 1: null, 2: null, 3: null }; // initialize round winners by round
        const arbitrePlayerMap = {};

        for (let roomId in values) {
          for (let roundNum in values[roomId]) {
            let roundWinner = { roundNum: roundNum, player: null }; // initialize round winner for current round
            let player1Wins = 0;
            let player2Wins = 0;

            for (let i = 0; i < values[roomId][roundNum].length; i++) {
              const { receivedArbitreName, receivedWinner } =
                values[roomId][roundNum][i];
              if (!arbitrePlayerMap[receivedArbitreName]) {
                arbitrePlayerMap[receivedArbitreName] = {};
              }
              if (!arbitrePlayerMap[receivedArbitreName][receivedWinner]) {
                arbitrePlayerMap[receivedArbitreName][receivedWinner] =
                  receivedWinner;
              }

              if (receivedWinner === 'player1') {
                player1Wins++;
              } else if (receivedWinner === 'player2') {
                player2Wins++;
              }
            }

            // determine round winner
            if (player1Wins > player2Wins) {
              roundWinner.player = 'player1';
              roundWinnersByRound[roundNum] = 'player1';
            } else if (player1Wins < player2Wins) {
              roundWinner.player = 'player2';
              roundWinnersByRound[roundNum] = 'player2';
            } else {
              roundWinner.player = 'equal';
              roundWinnersByRound[roundNum] = 'equal';
            }

            roundWinners.push(roundWinner);
          }
        }

        return {
          allRoundWinners: roundWinners,
          roundWinnersByRound: roundWinnersByRound,
        };
      } */

/* function updateRoundWinners(values) {
        let roundWinners = calculateRoundWinners(values);

        const roundElements = [r_1, r_2, r_3];

        for (let i = 0; i < 3; i++) {
          let winner = roundWinners.allRoundWinners.find(
            (round) => round.roundNum === String(i + 1)
          );
          if (winner) {
            roundElements[i].innerHTML = `${winner.player}`;
            if (winner.player === 'player1') {
              roundElements[i].style.backgroundColor = 'blue';
            } else if (winner.player === 'player2') {
              roundElements[i].style.backgroundColor = 'red';
            } else {
              roundElements[i].style.backgroundColor = 'green';
            }
          } else {
            roundElements[i].innerHTML = 'No winner';
            roundElements[i].style.backgroundColor = 'gray';
          }
        }
      } */

///checking if the arbitre already there :

/*  function doesArbitratorExist(values, arbitratorName, roundNum) {
        let roomMatches = values[roomid];
        if (!roomMatches) return false; // Make sure the room exists

        let roundMatches = roomMatches[roundNum];
        if (!roundMatches) return false; // Make sure the round exists

        // Loop through each match in the round and check if the arbitrator name exists
        for (let i = 0; i < roundMatches.length; i++) {
          let match = roundMatches[i];
          if (match.receivedArbitreName === arbitratorName) {
            return true;
          }
        }

        return false;
      } */

/*  document.getElementById('hehoclicke').addEventListener('click', () => {
        updateRoundWinners(values);
      }); */
