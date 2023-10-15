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

io.on('connection',(socket)=>{
    console.log("Socket id is :",socket.id);
})