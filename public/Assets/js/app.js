var AppProcess = (function(){
    var peers_connection_ids=[];
    var peers_connection=[];
     var serverProcess,my_connection_id;  
     var remote_vid_stream=[];  
     var remote_aud_stream=[];   

     async  function _init( SDP_function,my_connid)
        {
               serverProcess= SDP_function;
               my_connection_id=my_connid;
        }

   //stun server provides internal user information from computer like Network ,IP address 
   var iceConfiguration = {
    iceServers:[
        {
            urls:"stun:stun.l.google.com:19302",
        },
        {
            urls:"stun:stun1.l.google.com:19302",
        },
    ]
   } 
//console.log(iceConfiguration);
    async function setConnection(connid){
        var connection= new RTCPeerConnection(iceConfiguration)
        
        
        connection.onnegotiationneeded= async function(event){
            await setOffer(connid)
        }
        
        connection.onicecandidate = async function(event){
            if(event.candidate){
                // to send ice candiate details to other peers
                serverProcess( JSON.stringify({icecandidate:event.candidate}), connid) 
            }
        }
        connection.ontrack =async function(event){
            if(!remote_vid_stream[connid]){
                remote_vid_stream[connid]= new MediaStream();
            }
            if(!remote_aud_stream[connid]){
                remote_aud_stream[connid]= new MediaStream();
            }
           
            const track = event.track;

            if(track.kind=="video"){
                //deleting previous video and adding new one
                remote_vid_stream[connid]
                .getVideoTracks()
                .forEach((el)=> remote_vid_stream[connid].   removeTrack(el));
                remote_vid_stream[connid].addTrack(track);

                var remoteVideoPlayer = document.getElementById("v_"+connid);
                remoteVideoPlayer.srcObject=null; 
                remoteVideoPlayer.srcObject = remote_vid_stream[connid] ; //display new one
                remoteVideoPlayer.load();

            }else if (track.kind=="audio"){

                remote_aud_stream[connid]
                .getAudioTracks()
                .forEach((el)=> remote_aud_stream[connid].removeTrack(el));
                remote_aud_stream[connid].addTrack(track);

                var remoteAudioPlayer = document.getElementById("a_"+connid);
                remoteAudioPlayer.srcObject=null; 
                remoteAudioPlayer.srcObject = remote_aud_stream[connid] ; //display new one
                remoteAudioPlayer.load();
            }

              
        }

        peers_connection_ids[connid] = connid;
        peers_connection[connid]= connection;

        return connection;
    };

    function setOffer(connid){
        var connection = peers_connection[connid];
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        serverProcess(JSON.stringify({offer: connection.localDescription}), connid) 
    }
     //session description process(SDP)  ; check message offer or answer
    async function SDPProcess(message , from_connid){
        message = JSON.parse(message);
        
        if(message.answer){//here ,those who send offer  those side, check message is answer or not 

            //  Creating an RTCSessionDescription for an SDP offer /sender
            await peers_connection[from_connid].setRemoteDescription(new RTCSessionDescription(message.answer));

        }else if(message.offer){
            if(!peers_connection[from_connid]){
              await setConnection(from_connid);
              // ie peers_connection[from_connid]= connection;
            }

            var answer = await peers_connection[from_connid].createAnswer();
            // Creating an RTCSessionDescription for an SDP answer
           await peers_connection [from_connid].setRemoteDescription(new RTCSessionDescription(answer)); 

         await peers_connection[from_connid].setLocalDescription(message.offer);
         serverProcess(
              JSON.stringify({
                  answer: answer
             }),
             from_connid);

        }else if(message.icecandidate){
            if(!peers_connection[from_connid]){
                await setConnection(from_connid);
            }
            try{
                  await peers_connection[from_connid].addIceCandidate(message.icecandidate);
            }catch(error){
               console.log(error);
            }

        }  
    };

   
return{
        setNewConnection :  async function(connid){
            await setConnection(connid);
            },
        init: async function(SDP_function , my_connid){
                    await  _init(SDP_function,my_connid);
            }
        processClientFunc: async function(SDP_function , from_connid)    {
            await SDPProcess(data,from_connid)
        }

 }      
})();




var MyApp = (function(){
   var socket = null;
   var user_id="";
   var meeting_id="";

   function init(uid,mid){
        user_id=uid
        meeting_id=mid
        event_process_for_signaling_server();
 }
    
    function event_process_for_signaling_server(){
        socket = io.connect();
  
        var SDP_function = function(data,to_connid){
            socket.emit("SDPProcess",{
                message:data,
                to_connid:to_connid
            })
        }
        socket.on("connect",()=>{
            
            //1.send connected user data to server
            if(socket.connected){
                AppProcess.init(SDP_function,socket.id);

                if(user_id!="" && meeting_id!=""){
                    socket.emit("userconnect",{
                        displayName:user_id,
                        meetingid:meeting_id
                    })
               
                }
            }  
        })
        socket.on("inform_others_about_me",(data)=>{
            //2.Listen other user /members of group and add other user in meetingConference
              addUser(data.others_user_id, data.connId);

             //3.Set  Video,Audio coonection with other users
               AppProcess.setNewConnection(data.connId)
        })
        // client get  data from server , after listening client 
        socket.on("SDPProcess",  async function(data){
                 await AppProcess.processClientFunc(data.message,data.from_connid)
        })

        function addUser(others_user_id, connId){
            //for every user otherTemplate clone created and append to main div (divUsers)
          var newDivId = $("#otherTemplate").clone();
          newDivId=newDivId.attr("id",connId).addClass("other");
          newDivId.find("h2").text(others_user_id);
          newDivId.find("video").attr("id",connId);
          newDivId.find("audio").attr("id",connId);
          newDivId.show(); //display none xa uta , so tehivara show()gareko
          $("#divUsers").append(newDivId);
        }


    }      

       
 return{
        _init:function(uid,mid){
            init(uid,mid);
        }
    }      

})();