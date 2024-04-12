# My_Meeting_App

 In this app, Peers can perform group audio video streaming, screen sharing, group messaging, see participant details, file sharing, and meeting recording with this web-based tool, which has capabilities like Google Meet.

# Build by using :
 HTML,     CSS , Boostrap        JavaScript ,Jquery,  Node js(express)  ,  peerjs  
            ,      Socket.io      and      WebRTC
 
           

# Fetaures
1. Group Audio Video Streaming
2. Screen Sharing System
3. Messaging System
4. Showing  Participant Details
5.  File Sharing System
6.  Meeting Recording System
7.  and many more!


# SDP PROCESS 
In WebRTC, the negotiation process typically involves a series of steps, which often include the following:

1. Creating an offer (local description) using `createOffer()`.
2. Setting the local description with `setLocalDescription()`.
3. Sending the offer to the remote peer.
4. Receiving the remote peer's answer.
5. Setting the remote description with `setRemoteDescription()`.
6. Exchanging ICE candidates with the remote peer.
   
![ICE Shared](https://github.com/BheshRajNeupane/My_Meeting_App/assets/108607897/94906cfc-b262-4809-aed8-8be44ac6293a)




Certainly, here's a refined version of your project description:

---

# My Meeting App

My Meeting App is a web-based collaboration tool designed for group audio-video streaming, screen sharing, messaging, participant details viewing, file sharing, and meeting recording. It offers functionalities similar to Google Meet and is built using the following technologies:

- Frontend: HTML, CSS, Bootstrap, JavaScript, jQuery
- Backend: Node.js (Express)
- Peer-to-peer communication: PeerJS
- Real-time communication: Socket.io
- WebRTC for audio-video streaming and screen sharing

**Features:**

1. **Group Audio Video Streaming:** Peers can engage in real-time audio and video communication within groups.

2. **Screen Sharing System:** Participants can share their screens with others in the meeting.

3. **Messaging System:** Integrated chat system for text-based communication during meetings.

4. **Participant Details:** Provides information about meeting participants.

5. **File Sharing System:** Allows users to share files with other participants during the meeting.

6. **Meeting Recording System:** Capable of recording meetings for future reference or review.

7. **And many more!**

**SDP Process:**

In WebRTC, the Session Description Protocol (SDP) negotiation process involves several steps:

1. **Creating an Offer:** A local description is generated using the `createOffer()` method.
   
2. **Setting Local Description:** The local description is set using `setLocalDescription()`.

3. **Sending Offer:** The offer is sent to the remote peer.

4. **Receiving Answer:** The remote peer responds with an answer.

5. **Setting Remote Description:** The received answer is set as the remote description using `setRemoteDescription()`.

6. **ICE Candidate Exchange:** ICE candidates are exchanged between peers to establish connectivity using the Interactive Connectivity Establishment (ICE) framework.

![ICE Candidate Exchange](https://github.com/BheshRajNeupane/My_Meeting_App/assets/108607897/ice-candidate-exchange.png)

This negotiation process ensures that peers can establish a direct connection for audio, video, and data transmission, facilitating seamless communication during meetings.

---

Your Meeting App offers a comprehensive set of features for effective collaboration and communication among participants. It leverages modern web technologies to provide a user-friendly and efficient meeting experience.
