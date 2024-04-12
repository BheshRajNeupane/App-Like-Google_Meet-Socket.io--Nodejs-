
# My Meeting App

My Meeting App is a web-based collaboration tool for group audio-video streaming, screen sharing, messaging, participant details viewing, file sharing, and meeting recording. It offers functionalities similar to Google Meet and is built using the following technologies:

- Frontend: HTML, CSS, Bootstrap, JavaScript, jQuery
- Backend: Node.js (Express)
- Peer-to-peer communication: PeerJS
- Real-time communication: Socket.io
- WebRTC for audio-video streaming and screen sharing

**Features:**

1. **Group Audio Video Streaming:** Peers can communicate in real-time audio and video within groups.

2. **Screen Sharing System:** Participants can share their screens with others in the meeting.

3. **Messaging System:** Integrated chat system for text-based communication during meetings.

4. **Participant Details:** Provides information about meeting participants.

5. **File Sharing System:** Allows users to share files with other participants during the meeting.

6. **Meeting Recording System:** Capable of recording meetings for future reference or review.

7. **And many more!**

   
![ICE Shared](https://github.com/BheshRajNeupane/My_Meeting_App/assets/108607897/94906cfc-b262-4809-aed8-8be44ac6293a)


**SDP Process:**

In WebRTC, the Session Description Protocol (SDP) negotiation process involves several steps:

1. **Creating an Offer:** A local description is generated using the `createOffer()` method.
   
2. **Setting Local Description:** The local description is set using `setLocalDescription()`.

3. **Sending Offer:** The offer is sent to the remote peer.

4. **Receiving Answer:** The remote peer responds with an answer.

5. **Setting Remote Description:** The received answer is set as the remote description using `setRemoteDescription()`.

6. **ICE Candidate Exchange:** ICE candidates are exchanged between peers to establish connectivity using the Interactive Connectivity Establishment (ICE) framework.



This negotiation process ensures that peers can establish a direct connection for audio, video, and data transmission, facilitating seamless communication during meetings.

