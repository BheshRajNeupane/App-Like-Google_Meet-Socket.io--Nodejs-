var AppProcess = (function(){
     var peers_connection_ids=[];
     var peers_connection=[];
     var serverProcess,my_connection_id;  
     var remote_vid_stream=[];  
     var remote_aud_stream=[];   
     var local_div;
     var audio;
     var videoCamTrack;
     var rtp_aud_senders=[];
     var rtp_vid_senders=[];
     var isAudioMute = true;
     var video_states = { //to know where video is coming from , camera or screen( while presenting)
         None:0,
         Camera:1,
         ScreenShare:2
     }
    var video_st = video_states.None; 

     async  function _init( SDP_function,my_connid)
        {
               serverProcess= SDP_function;
               my_connection_id=my_connid;
               eventProcess();
               local_div=document.getElementById("localVideoPlayer");
        }

     //eventProcess(); mic_on_off(audio) ,video(camera ,screenshare)
    function eventProcess(){
         //for audio
          $("#miceMuteUnmute").on('click', async function(){
                if(!audio){
                    await loadAudio();
                }
                if(!audio){
                    alert("Audio permission has not granted");
                    return;
                }
                if(isAudioMute){
                    audio.enabled = true;
                    $(this).html("<span class= 'material-icons ' style='width:100%'>mic</span>")
                    
                    updateMediaSenders(audio,rtp_aud_senders);
                }else{
                    audio.enabled = false;
                    $(this).html("<span class= 'material-icons ' style='width:100%'>mic_off</span>")
                    //remove audio from track
                    removeMediaSenders(rtp_aud_senders);
                }
                isAudioMute = !isAudioMute;
            });
           // video :video from camera
           
         $("#videoCamOnOff").on('click', async function(){
           
                if(video_st==video_states.Camera) {
                    await videoProcess(video_states.None);
                }else{
                    await videoProcess(video_states.Camera);
                }
              })
          //video: from  screenshare)
         $("#btnScreenShareOnOff").on('click', async function(){
                if(video_st==video_states.ScreenShare) {
                    await videoProcess(video_states.None);
                }else{
                    await videoProcess(video_states.ScreenShare);
                }      
        })

    }

    async function loadAudio(){
        try {
             var astream=  await navigator.mediaDevices.getUserMedia({
                 video: false,
                 audio:true
             })
             audio = astream.getAudioTracks()[0];
             audio.enabled= false;
        } catch (error) {
            console.log(error);
        }
    }
 
    function connection_status(connection){
        if(
            connection &&
            (connection.connectionState=="new"||
            connection.connectionState=="connecting"||
            connection.connectionState=="connected")
        ){

             return true;
        }else{
            return false;
        }
    };
    // function to  update  track(audio , video[ either by camera ,screenshare]) in webRTC
    
    async  function updateMediaSenders(track,rtp_senders){
        console.log("inside updateMediaSenders0000000" ,peers_connection_ids);
         for(var con_id in peers_connection_ids){
//peers_connection_ids.forEach((con_id) =>{
    console.log("inside updateMediaSender insde forEach 1st")
             if( connection_status(peers_connection[con_id])){
                 if(rtp_senders[con_id] && rtp_senders[con_id].track){
                    console.log("inside updateMediaSenders111")
                    rtp_senders[con_id].replaceTrack(track);
                 }else{
                     console.log("inside updateMediaSenders");
                    rtp_senders[con_id]=peers_connection[con_id].addTrack(track)
                }
             }

         }
    }
     //remove vidoe from interface 
     function   removeMediaSenders(rtp_senders){
           for(var con_id in peers_connection_ids){
               if(rtp_senders[con_id] && connection_status(peers_connection[con_id])){
                peers_connection[con_id].removeTrack(rtp_senders[con_id]);
                rtp_senders[con_id]=null;
               }
           }
     }

    function removeVideoStream(rtp_vid_senders){
        if(videoCamTrack){
            videoCamTrack.stop();
            videoCamTrack=null;
            local_div.srcObject=null;
            removeMediaSenders(rtp_vid_senders);
        }

    }
    async function videoProcess(newVideoState){
        
          if(newVideoState==video_states.None){
              $("#videoCamOnOff").html("<span class='material-icons ' >videocam_off</span>");

              $("#btnScreenShareOnOff").html("<span class='material-icons ' >present_to_all</span><div>Present Now </div>");
          
             video_st=newVideoState;
             removeVideoStream(rtp_vid_senders);
             return;
          }

          if(newVideoState==video_states.Camera){
              $("videoCamOnOff").html("<span class='material-icons 'style='width:100%' >videocam_on</span>")
          }

          

           try {
               console.log("newvideosatat",newVideoState);
               var vstream=null;
               if(newVideoState==video_states.Camera){
                vstream=await navigator.mediaDevices.getUserMedia({
                       video:{
                           width:1920,
                           height:1080
                       },
                       audio:false

                   })
               }else if(newVideoState==video_states.ScreenShare){
                vstream=await navigator.mediaDevices.getDisplayMedia({
                    video:{
                        width:1920,
                        height:1080
                    },
                    audio:false
                   });
                //    This event handler will be triggered when the media stream becomes inactive. Media streams can become inactive for various reasons, such as when the user stops sharing their screen.
                vstream.oninactive=(e)=>{
                    removeVideoStream(rtp_vid_senders);
                    $("#btnScreenShareOnOff").html("<span class='material-icons  ' >present_to_all</span><div>  Present Now </div>");
                }
            }

             if(vstream && vstream.getVideoTracks().length>0) {
                 videoCamTrack=vstream.getVideoTracks()[0];
                 if(videoCamTrack){
                     local_div.srcObject = new MediaStream([videoCamTrack]);
                     console.log("videoCamTrack",videoCamTrack);
                     //console.log("",);
                     updateMediaSenders(videoCamTrack,rtp_vid_senders);
                 }
             }


           } catch (error) {
             console.log(error);
             return;
           }

           video_st =newVideoState;
           if(newVideoState==video_states.Camera){
            $("#videoCamOnOff").html("<span class='material-icons 'style='width:100%' >videocam</span>");

            $("#btnScreenShareOnOff").html("<span class='material-icons  ' >present_to_all</span><div >  Present Now </div>");

           }else if(newVideoState==video_states.ScreenShare){
            $("#btnScreenShareOnOff").html("<span class='material-icons  text-success' >present_to_all</span><div class='text-success'> Stop Present Now </div>");

            $("#videoCamOnOff").html("<span class='material-icons 'style='width:100%' >videocam_off</span>");
           }

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
         console.log("connection" , connection);

        //  peers_connection_ids[connid] = connid;
        // peers_connection[connid]= connection;
        
        connection.onnegotiationneeded= async function(event){
            console.log("    setconnection onnegotiationneeded .......", event);
            await setOffer(connid);
        }
        console.log("onnegotiationneeded" , connection.onnegotiationneeded());
        connection.onicecandidate = async function(event){
            console.log("    setconnection onicecandidate eceny  ......." , event);
            console.log("   event.candidate ......." , event.candidate);
            if(event.candidate){
                // to send ice candiate details to other peers
                serverProcess( JSON.stringify({icecandidate:event.candidate}), connid) 
            }
        }
        console.log("onicecandidate" , connection.onicecandidate());
        // The ontrack event is triggered when remote media tracks are received.
        connection.ontrack =async function(event){

            console.log("  inside on track  setconnection.......");
            if(!remote_vid_stream[connid]){
                remote_vid_stream[connid]= new MediaStream();
            }
            if(!remote_aud_stream[connid]){
                remote_aud_stream[connid]= new MediaStream();
            }
           
            console.log("taall",event , connid,remote_vid_stream[connid]);
           ;
            console.log("track kind",event.track.kind);
            console.log("aashihs");

            if(event.track.kind=="video"){
                console.log("Testing video!!!!!!!!");
                //deleting previous video and adding new one
                remote_vid_stream[connid]
                .getVideoTracks()
                .forEach((el)=> remote_vid_stream[connid].   removeTrack(el));
                remote_vid_stream[connid].addTrack(track);

                var remoteVideoPlayer = document.getElementById("v_"+connid);
                remoteVideoPlayer.srcObject=null; 
                remoteVideoPlayer.srcObject = remote_vid_stream[connid] ; //display new one
                remoteVideoPlayer.load();

            }else if (event.track.kind=="audio"){

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
        console.log("ontrack" , connection.ontrack());

        peers_connection_ids[connid] = connid;
        peers_connection[connid]= connection;

        console.log("testing 2...!!!!!!!" ,video_st );

            if(
                video_st==video_states.Camera||video_st==video_states.ScreenShare
                ){
                 if(videoCamTrack){
                  updateMediaSenders(videoCamTrack,rtp_vid_senders);
               }
         }   
     return connection;
    }


    async function setOffer(connid){
        var connection = peers_connection[connid];
        console.log("peers_connection coonid" , peers_connection[connid]);
          for(var i=0; i<peers_connection.length; i++){
        console.log("peers_connection[connid]" , peers_connection[i]);
          }
        console.log("conn insete offer" , connection);
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
            console.log('mesaasge',message);
            console.log('mesaasge tala peerr_conn',peers_connection[from_connid]);
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
     //Disconnect
    async function closeConnection(connid){
          peers_connection_ids[connid] =null;
          if(peers_connection[connid]){
              peers_connection[connid].close(); //connection off
              peers_connection[connid]=null;
          }
          
          if(remote_aud_stream[connid]){
              remote_aud_stream[connid].getTracks().forEach((t)=>{
                  if(t.stop)  t.stop(); //stop streamming audio
              })
              remote_aud_stream[connid]=null;
          }
          if(remote_vid_stream[connid]){
              remote_vid_stream[connid].getTracks().forEach((t)=>{
                  if(t.stop)  t.stop();
              })
              remote_vid_stream[connid]=null;
          }
    }

   
 return{
        setNewConnection :  async function(connid){
            await setConnection(connid);
            },
        init: async function(SDP_function , my_connid){
                    await  _init(SDP_function,my_connid);
            },
        processClientFunc: async function(data , from_connid)    {
            await SDPProcess(data,from_connid)
        },
        closeConnectionCall: async function(connid)    {
            await closeConnection(connid)
        }
    }  

    } )();



var MyApp = (function(){
   var socket = null;
   var user_id="";
   var meeting_id="";

   function init(uid,mid){
        user_id=uid
        meeting_id=mid;
        $("#meetingContainer").show();
        $("#me h2").text(user_id+"(Me)"); //username show
        document.title= user_id; 
        event_process_for_signaling_server();
        eventHandeling();
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
              addUser(data.other_users_id, data.connId);

             //3.Set  Video,Audio coonection with other users
             console.log(" before setconnection.......");
               AppProcess.setNewConnection(data.connId)
               console.log(" after setconnection.......");
        })

       socket.on("inform_other_about_disconnected_user",function(data){
           $("#"+data.connId).remove(); //remove otherUser div
           AppProcess.closeConnectionCall(data.connId);

       })

        socket.on("inform_me_about_other_user", function (other_users){
             if(other_users)
             {
                    for(var i=0; i<other_users.length;i++)
                    {
                        console.log("  tala before setconnection.......");
                       addUser(other_users[i].user_id, other_users[i].connectionId);
                       AppProcess.setNewConnection(other_users[i].connectionId)
                    }
             }
        })



        // client get  data from server , after listening client 
        socket.on("SDPProcess",  async function(data){
                 await AppProcess.processClientFunc(data.message,data.from_connid)
        })

        socket.on("showChatMessage" , function(data){
            var time = new Date();
            var lTime = time.toLocaleString("en-US" , {
                hour: "numeric",
                minute:"numeric",
                hour12:true
            });
           var div = $("<div>").html("<span class='font-weight-bold mr-3' style='color:black'>"+
           data.from +' '+
           "</span>"+
           lTime+
           "</br>"+
           data.message
           );

           $("#messages").append(div);
       })   
    }; //closd  event_process_for_signaling_server

    function eventHandeling(){
        $("#btnsend").on("click" , function(data){
            var message = $('#msgbox').val();

            socket.emit("sendMessage" , message );

            var time = new Date();
            var lTime = time.toLocaleString("en-US" , {
                hour: "numeric",
                minute:"numeric",
                hour12:true
            });
            var div = $("<div>").html("<span class='font-weight-bold mr-3' style='color:black'>"+
              user_id +' '+
            "</span>"+
            lTime+
            "</br>"+
            message
            );
 
            $("#messages").append(div);
            $('#msgbox').val("");
         })
     }     
   
    function addUser(other_users_id, connId){
            //for every user otherTemplate clone created and append to main div (divUsers)
          var newDivId = $("#otherTemplate").clone();
          newDivId=newDivId.attr("id",connId).addClass("other");
          newDivId.find("h2").text(other_users_id);
          newDivId.find("video").attr("id",connId);
          newDivId.find("audio").attr("id",connId);
          newDivId.show(); 
          $("#divUsers").append(newDivId);
        }



       
 return{
        _init:function(uid,mid){
            init(uid,mid);
        }
    }      

})();