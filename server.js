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
            var other_user = userConnections.filter(user=>user.meeting_id==data.meetingid) ;   
            
            //3.Store all connected users
                userConnections.push({
                    connectionId:socket.id,
                    user_id:data.displayName,
                    meeting_id:data.meetingid
                })
                // console.log(userConnections);
                // console.log(other_user);

                //4. Inform all members of same room (group's members) about you    
                other_user.forEach((user)=>{
                    socket.to(user.connectionId).emit("inform_others_about_me" ,{
                        other_user_id:data.displayName,
                        connId:socket.id
                        //this is my user_id and connId but i write other_user_id because for them my id is other id so.
                    })
                    
                   
                })
       
        });
    socket.on("SDPProcess" , (data)=>{
        socket.to(data.to_connid).emit("SDPProcess",{
            message:data.message,
            from_connid:socket.id
        })
    })    
})