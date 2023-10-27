const express = require('express');
const path = require('path');
var app = express();


const port = 3000;

var server = app.listen(port , ()=>{
    console.log("Listiening server at port ",port);
})

const io= require('socket.io')(server ,{
    allowEIO3: true
});
app.use(express.static(path.join(__dirname,"")));

var userConnections=[];

io.on('connection',(socket)=>{
   
    console.log("Socket id is :",socket.id);
     //1.new connection
    socket.on("userconnect" ,(data)=>{
            console.log("userconnect:",data.displayName,data.meetingid);
            //2. find  other user of same meeting group 
            var other_users = userConnections.filter(user=>user.meeting_id==data.meetingid) ;   
            
            //3.Store all connected users
                userConnections.push({
                    connectionId:socket.id,
                    user_id:data.displayName,
                    meeting_id:data.meetingid
                })
                // console.log(userConnections);
                // console.log(other_user);

                //4. Inform all members of same room (group's members) about you    
                other_users.forEach((user)=>{
                    socket.to(user.connectionId).emit("inform_others_about_me" ,{
                        other_users_id:data.displayName,
                        connId:socket.id
                        //this is my user_id and connId but i write other_user_id because for them my id is other id so.
                    })    
                })
            socket.emit("inform_me_about_other_user", other_users) ;

       
        });
    socket.on("SDPProcess" , (data)=>{
        socket.to(data.to_connid).emit("SDPProcess",{
            message:data.message,
            from_connid:socket.id
        })
    });
    
  socket.on("sendMessage" ,(msg)=>{
      console.log(msg);
      var mUser = userConnections.find((p)=> p.connectionId==socket.id);//sender
      var meetingid= mUser.meeting_id;
      var from = mUser.user_id;
      var list = userConnections.filter((v)=> v.meeting_id == meetingid);
      list.forEach((v)=>{
          socket.to(v.connectionId).emit("showChatMessage" ,{
                 from:from,
                 message:msg
          } )
      })

  })

    socket.on("disconnect", function(){
        console.log("Disconnect id :" ,socket.id);
        var disUser = userConnections.find(
            (p)=>p.connectionId==socket.id
            );
            userConnections= userConnections.filter((p)=>p.connectionId != socket.id);
        var list =  userConnections.filter((p)=>p.meeting_id==disUser.meeting_id);
        list.forEach((p)=>{
            socket.to(p.connectionId).emit("inform_other_about_disconnected_user",{
                connId:socket.id

            });
        })

    })
})