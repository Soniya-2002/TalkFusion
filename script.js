const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');
// const chatForm = document.getElementById('chat-form');
// const chatInput = document.getElementById('chat-input');
// const submit = document.getElementById('submit');
let localStream;
let remoteStream;
let peerConnection;
let socket;
// const socket = io();
// Function to start the call
async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Initialize signaling
        socket = io();

        // Create peer connection
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnection = new RTCPeerConnection(configuration);

        // Add local stream to peer connection
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Handle remote stream
        peerConnection.ontrack = event => {
            if (!remoteStream) {
                remoteStream = new MediaStream();
                remoteVideo.srcObject = remoteStream;
            }
            remoteStream.addTrack(event.track);
        };

        // Send offer to the signaling server
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);

        // Handle answer from the other user
        socket.on('answer', async answer => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // Handle ICE candidate exchange
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate);
            }
        };

        socket.on('ice-candidate', async candidate => {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        socket.on('offer', async offer => {
            if (!peerConnection.currentRemoteDescription) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit('answer', answer);
            }
        });

    } catch (error) {
        console.error('Error starting the call:', error);
    }
}

// Function to end the call
function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    if (socket) {
        socket.close();
    }
}
startCallButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);
// Function to send a chat message
// // Function to send a chat message
function sendChatMessage(message) {
    // Emit the message to the signaling server
    socket.emit('chat-message', message);
}

// Event listener for sending chat messages
// chatForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const message = chatInput.value.trim();
//     if (message !== '') {
//         sendChatMessage(message);
//         chatInput.value = ''; // Clear the input field after sending
//     }
// });

// // Event listener for receiving chat messages
// socket.on('chat-message', (message) => {
//     // Display the received message in the UI
//     displayChatMessage(message);
// });
// / Function to send a chat message


// Function to display a chat message in the UI
// function displayChatMessage(message) {
//     const messageElement = document.createElement('div');
//     messageElement.textContent = message;
//     // Append the message element to the chat container
//     chatContainer.appendChild(messageElement);
// }
// // Event listener for sending chat messages
// chatForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const message = chatInput.value.trim();
//     console.log('Sending chat message:', message); // Add logging
//     if (message !== '') {
//         sendChatMessage(message);
//         chatInput.value = ''; // Clear the input field after sending
//     }
// });
// function sendChatMessage(message) {
//     // Emit the message to the signaling server
//     socket.emit('chat-message', message);
// }

// // Event listener for sending chat messages
// chatForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const message = chatInput.value.trim();
//     if (message !== '') {
//         sendChatMessage(message);
//         chatInput.value = ''; // Clear the input field after sending
//     }
// });

// // Event listener for receiving chat messages
// socket.on('chat-message', (message) => {
//     // Display the received message in the UI
//     displayChatMessage(message);
// });
