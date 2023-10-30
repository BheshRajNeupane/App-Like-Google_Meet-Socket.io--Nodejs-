const express = require('express');
const path = require('path');
var app = express();
const  fs = require('fs');
const fileUpload = require('express-fileupload');
const port = 7400;

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
        var userCount = userConnections.length;
                //4. Inform all members of same room (group's members) about you    
                other_users.forEach((user)=>{
                    socket.to(user.connectionId).emit("inform_others_about_me" ,{
                        other_users_id:data.displayName,
                        connId:socket.id,
                        userNumber:userCount
               
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
      var mUser = userConnections.find((p)=> p.connectionId==socket.id);//sender
      if(mUser){
        var meetingid= mUser.meeting_id;
        var from = mUser.user_id;
        var list = userConnections.filter((v)=> v.meeting_id == meetingid);
        list.forEach((v)=>{
                
            socket.to(v.connectionId).emit("showChatMessage" ,{
                    from:from,
                    message:msg
            } )
        })
    }
  });

  socket.on("fileTranserToOther", (msg)=>{
    var mUser = userConnections.find((p)=> p.connectionId==socket.id);//sender
     if(mUser){ 
        var meetingid= mUser.meeting_id;
        var from = mUser.user_id;
        var list = userConnections.filter((v)=> v.meeting_id == meetingid);
        list.forEach((v)=>{
            
            socket.to(v.connectionId).emit("showFileMessage" ,{
                username:msg.username,
                meetingid: msg.meetingid,
                filePath:msg.filePath,
                fileName:msg.fileName,
            } )
        })
   }
  })

    socket.on("disconnect", function(){
        console.log("Disconnect id :" ,socket.id);
        var disUser = userConnections.find(
            (p)=>p.connectionId==socket.id
            );
            userConnections= userConnections.filter((p)=>p.connectionId != socket.id);
        var list =  userConnections.filter((p)=>p.meeting_id==disUser.meeting_id);
        list.forEach((p)=>{       
            var userNumberAfterUserLeave = userConnections.length;
            socket.to(p.connectionId).emit("inform_other_about_disconnected_user",{
                connId:socket.id,
                uNumber:userNumberAfterUserLeave

            });
        })

    })
})

app.use(fileUpload());

app.post('/attachimg'  ,(req,res)=>{
    var data = req.body;
    var imageFile = req.files.zipfile;
    var fileName = imageFile.name;
        
    var dir = "public/attachment/"+data.meeting_id+"/";
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      ;
    }
    //move an uploaded file to a specified destination on server.
    imageFile.mv( "public/attachment/"+data.meeting_id+"/"+fileName , function(error){
        if(error){
            console.log("couldn't upload the  file, error" , error);
        }else{
            console.log(" file successfully uploaded");
        }
    })

})