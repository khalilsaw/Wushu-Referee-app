let valueToSend = 'blue';

  // Send the value to the server when the user clicks the button
  document.getElementById('blue-button').addEventListener('click', () => {
    console.log("first")
    socket.emit('send-value', valueToSend);
  });