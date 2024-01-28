const socket = io('/'); // it's the root path
const videoGrid = document.getElementById('video-grid'); // where we place all of our new videos
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});
const myVideo = document.createElement('video');
myVideo.muted = true; // it's like we don't want to hear our own video; it's not gonna mute for other people.
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true, // it's true because we want audio and video to be sent to other people
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  // Listen for the 'user-connected' event from the server
  socket.on('user-connected', (userId) => {
    // Call the function to connect to the new user with their userId
    connectToNewUser(userId, stream); // so we need to send the current video stream to the user with whom we are trying to connect.
  });

  // Listen for the 'open' event from the Peer object
  peer.on('open', id => {
    console.log('My peer ID is: ' + id);
    // Send the 'join-room' event to the server with the ROOM_ID
    socket.emit('join-room', ROOM_ID);
  });

  // Listen for the 'user-connected' event from the server
  socket.on('user-connected', (userId) => {
    // Call the function to connect to the new user with their userId
    connectToNewUser(userId, myVideoStream);
  });

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
  });
});

// Function to connect to a new user
function connectToNewUser(userId, stream) {
  console.log('User connected: ' + userId);

  // Create a call to the new user using the Peer object
  const call = peer.call(userId, stream); // we will pass the video stream to that user

  // Create a new video element for the remote user
  const video = document.createElement('video');

  // Answer the call and add the remote stream to the video element
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream); // so when we send them our video stream & when they send their their video it is added.
  });

  // Handle call closing or remote user disconnecting
  call.on('close', () => {
    video.remove(); // when the call has been ended we don't end up having the video laying around who are connected anymore
  });

  peers[userId] = call; // every userId is linked to the call we make
}

// Function to add video stream to the DOM
const addVideoStream = (video, stream) => {
  video.srcObject = stream; // this will allow playing our video
  video.addEventListener('loadedmetadata', () => {
    video.play(); // when it is loaded on our page the video should be played
  });
  videoGrid.append(video); // so this basically like the container is appending the video in it 
};

socket.on('user-disconnected', userId => {
  connectToNewUser(userId);
});





const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}