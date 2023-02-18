// Listen for the 'send-value' event and log the received value
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



  //redirection code 

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
  });

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



  // Decrement the counter when an arbitr disconnects
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

    io.to(`admin`).emit('update-values', updatedValues);
  });


//when a tv connected

socket.on('tv-connected', () => {
    console.log('A TV has connected to the server!');
  });
//tvplayers
socket.on('tv-players-connected',()=>{
    console.log("a tv-players-get-connected-o-the-server")
})


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

    io.emit('selected-round', round);
});


//outcard event
socket.on("outcard", (winnercolor) => {
    console.log("out card service "+ winnercolor);
    io.emit("outcardV2",winnercolor);
  })


//checking roles 
if (users[socket.id] && users[socket.id].role === adminRole) {
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
  