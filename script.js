const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');

let localStream;
let remoteStream;
let peerConnection;
let socket;

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
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
        };

        // Send offer to the signaling server
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);

        // Handle answer from the other user
        socket.on('answer', async answer => {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        
        peerConnection.onicecandidate = event => {// Handle ICE candidate exchange
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate);
            }
        };

        
        socket.on('ice-candidate', async candidate => {// Handle incoming ICE candidates
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
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
