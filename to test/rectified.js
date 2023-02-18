/* // Listen for the 'send-value' event and log the received value
socket.on('send-value', (value, round ,p1,p2) => {
    console.log(value + '  - with id : ' + socket.id)
    if(!round){
      round=1;
    }
    const userExists = values[round].some((val) => val.userId === socket.id);
    if (!userExists) {
      // If the user id does not exist, push a new object with the user id and value to the values object
      values[round].push({
        userId: socket.id,
        value: value,
        numC : numConnectedArbitr
      });
    }
    io.emit('receive-values', values , p1 ,p2);
    console.log(values)
  });

 */

  /* //redirection code  for timer

  socket.on('start-timer-admin', ()=>{
    console.log("timer in server changed")
    io.emit('start-timer',)
  });

  socket.on('pause-timer-admin', ()=>{
    console.log("timer in server changed" )
    io.emit('pause-timer')
  });
  socket.on('restart-timer-admin', ()=>{
    console.log("timer in server changed" )
    io.emit('restart-timer')
  }); */

/*   //redirect url to winner

  socket.on('redirect-player-to-tv' , (url3)=>{
    io.emit('redirect-player-to-tv-from-server' , url3);
    console.log(url3)
  })

  socket.on('redirect-tv-to-winner', (url)=>{
    io.emit('redirect-tv-to-winner-from-server' , url);
    console.log(url)
  })

  socket.on('redirect-tv-to-players', (url2)=>{
    io.emit('redirect-tv-to-players-from-server' , url2);
    console.log(url2)
  })
 */


  /* // Decrement the counter when an arbitr disconnects
  socket.on('disconnect', () => {
    const user = users[socket.id];
     if (user && user.role === arbitreRole) {
       numConnectedArbitr = numConnectedArbitr-1;
       console.log("now it decrement ((-)) " + numConnectedArbitr + " connected ");
     }
     if (user && user.role === 'admin') {
      numConnectedAdmin--;
    }
    console.log(`user ${socket.id} disconnected`);
    delete users[socket.id];

    // Filter the values object to exclude the user's id and value
    updatedValues = {
      1: values[1].filter((val) => val.userId !== socket.id),
      2: values[2].filter((val) => val.userId !== socket.id),
      3: values[3].filter((val) => val.userId !== socket.id)
    };
    values = updatedValues;

    io.to(roomid).emit('update-values', updatedValues);
  });
 */

//when a tv connected

/* socket.on('tv-connected', () => {
    console.log('A TV has connected to the server!');
  });
//tvplayers
socket.on('tv-players-connected',()=>{
    console.log("a tv-players-get-connected-o-the-server")
})
 */

/* // Listen for the 'select-round' event
socket.on('select-round', (round) => {
  console.log(`Admin selected round ${round}`);

  // Update the values object with the selected round
  values = {
  1: round === '1' ? values[1] : values[1],
  2: round === '2' ? values[2] : values[2],
  3: round === '3' ? values[3] : values[3]
  };

  // Emit an event to the arbitre client with the selected round value

  io.emit('selected-round', round);
});
 */

/* //outcard event
socket.on("outcard", (winnercolor) => {
    console.log("out card service "+ winnercolor);
    io.emit("outcardV2",winnercolor);
  })

 */
//checking roles 
/* if (users[socket.id] && users[socket.id].role === adminRole) {
    socket.join(adminRole);
}
// If the number of connected admin clients exceeds the maximum, disconnect the user
if (role === 'admin' && numConnectedAdmin > maxAdminConnections) {
    console.log(`Maximum number of connections reached for admin, disconnecting user ${socket.id}`);
    socket.disconnect(true);
    return;
}
// If the number of connected arbitr exceeds the maximum, disconnect the user
if (role === arbitreRole && numConnectedArbitr >= maxConnections) {
    console.log(`Maximum number of connections reached for arbitr, disconnecting user ${socket.id}`);
    socket.disconnect(true);
    return;
}


//some checks
if (role === 'admin') {
    numConnectedAdmin++;
  }

  if (role === arbitreRole) {
    numConnectedArbitr++;
    console.log(numConnectedArbitr + " connected")
    io.to(adminRole).emit('new-arbitre', socket.id);
  }



   /* // Store the user's role in the users object
      users[socket.id] = {
        username: username,
        role: role,
      }; */



      const express = require('express');
      const path = require('path');
      const app = express();
      const http = require('http');
      const { clippingParents } = require('@popperjs/core');
      const server = http.createServer(app);
      const io = require('socket.io')(server);
      const adminRole = 'admin';
      const arbitreRole = 'arbitre';
      
      let rooms = [];
      const users = new Map();
      
      
      let numConnectedArbitr = 0; // Counter variable to track the number of connected arbitr
      const maxConnections = 5;
      let numConnectedAdmin = 0; // Counter variable to track the number of connected admin clients
      const maxAdminConnections = 1; // Maximum number of connections for admin clients
      
      
      
      
      app.use('/img/', express.static(path.join(__dirname, 'img')));
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
        // Declare the values object for this connection
        let values = {
          1: [],
          2: [],
          3: []
        };
      
        let updatedValues = {
          1: [],
          2: [],
          3: []
        };
        // check rooms
        socket.on('check-room', ({ roomid, role }, callback) => {
          // Check whether the room exists
          // Your code for checking the room can go here
          const roomExists = rooms.includes(roomid); // set this variable to true or false based on your check
          callback({ exists: roomExists });
        });
      
        // store rooms
        socket.on('generated-room-stored',(roomid)=>{
          rooms.push(roomid);
        });
      
        // when a user gets connected
        socket.on('login', ({ username, role, roomid }) => {
          console.log(`${username} connected to server as ${role} in room ${roomid} //////// ${socket.id}`);
          // Add the user to the specified room
          socket.join(roomid);
          // Create an object to hold the values for this room
          if (!values[roomid]) {
            values[roomid] = {
              1: [],
              2: [],
              3: []
            };
          }
          console.log(values.roomid + "when join");
          // Store the user's details and socket ID in the map
          users.set(username, { id: socket.id, role, roomid });
          // Broadcast a message to all connected users in the room
          io.to(roomid).emit('message', `${username} (${role}) has joined the chat in room ${roomid}`);
      
          /* --------------------------------------------------------------------------------------- */
          // Listen for the 'send-value' event and log the received value
          socket.on('send-value', (winner, round, roomid) => {
            console.log(winner + '  - with id : ' + socket.id)
            if (!round) {
              round = 1;
            }
            const userExists = values[roomid][round].some((val) => val.userId === socket.id);
            if (!userExists) {
              // If the user id does not exist, push a new object with the user id and value to the values object
              values[roomid][round].push({
                userId: socket.id,
                value: winner,
                round: round
              });
              console.log("code executed how i dont know")
            }
      
            console.log(values[roomid][round].userId +" "+ values[roomid][round].winner +" "+ values[roomid][round].round + " when send value");
      
            /* io.emit('receive-values', values , p1 ,p2); */
            io.to(roomid).emit('receive-values',winner, round , roomid);
            console.log(values[roomid]);
          });
      
          //redirection code  for timer
      
          socket.on('start-timer-admin', ()=>{
            console.log("timer in server changed")      
            io.to(roomid).emit('start-timer');
          });
      
          socket.on('pause-timer-admin', ()=>{
            console.log("timer in server changed" )
            io.to(roomid).emit('pause-timer');
          });
          socket.on('restart-timer-admin', ()=>{
            console.log("timer in server changed" )
            io.to(roomid).emit('restart-timer');
          });
      
          // Listen for the 'select-round' event
          socket.on('select-round', (round) => {
            console.log(`Admin selected round ${round}`);
      
            // Update the values object with the selected round
            values = {
            1: round === '1' ? values[1] : values[1],
            2: round === '2' ? values[2] : values[2],
            3: round === '3' ? values[3] : values[3]
            };
      
            // Emit an event to the arbitre client with the selected round value
      
            io.to(roomid).emit('selected-round', round);
          });
      
      
      
      
          //redirect url to winner
      
          socket.on('redirect-player-to-tv' , (url3)=>{
            io.to(roomid).emit('redirect-player-to-tv-from-server' , url3);
            console.log(url3)
          });
      
          socket.on('redirect-tv-to-winner', (url)=>{
            io.to(roomid).emit('redirect-tv-to-winner-from-server' , url);
            console.log(url)
          });
      
          socket.on('redirect-tv-to-players', (url2)=>{
            io.to(roomid).emit('redirect-tv-to-players-from-server' , url2);
            console.log(url2)
          });
      
          //outcard event
          socket.on("outcard", (winnercolor) => {
            console.log("out card service "+ winnercolor);
            io.to(roomid).emit("outcardV2",winnercolor);
          })
      
      
      
        
          // Decrement the counter when an arbitrator disconnects
          socket.on('disconnect', () => {
            const user = users[socket.id];
            if (user && user.role === arbitreRole) {
              numConnectedArbitr--;
              console.log(`Arbitrator ${socket.id} disconnected. ${numConnectedArbitr} arbitrators remaining.`);
            } else if (user && user.role === 'admin') {
              numConnectedAdmin--;
              console.log(`Admin ${socket.id} disconnected. ${numConnectedAdmin} admins remaining.`);
            } else {
              console.log(`User ${socket.id} disconnected.`);
            }
      
            delete users[socket.id];
            
            // Leave the room the user joined
            socket.leave(roomid);
      
            console.log(users)
            // Filter the values object to exclude the user's id and value
            updatedValues = {
              1: values[1].filter((val) => val.userId !== socket.id),
              2: values[2].filter((val) => val.userId !== socket.id),
              3: values[3].filter((val) => val.userId !== socket.id)
            };
            values = updatedValues;
            console.log(values)
          });
      
        });
      });
      
      
      const PORT = 3000;
      server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
      });
      
      
       
  