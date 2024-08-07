require('dotenv').config();
require("./utils/db");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const authRoute = require("./router/authRoute");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const cors = require("cors");
app.use(cors());

//to serve static files
app.use('/public', express.static('public'));

//add middleware to recognize incomming request object as JSON object
app.use(express.json());

//middleware for post req to get the data
// When extended is set to false, the querystring library is used to parse the URL-encoded data, and it does not support nested objects. 
// If you set extended to true, the qs library is used, which allows for nested objects in the URL-encoded data.
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);

server.listen(port, () => {
    console.log(`server running at port : ${port}`)
})



const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_ORIGIN,//frontend or backend dono alg alg port pr chl rhe hai security point of view se chrome hmari req ko block kr rha tha
    }
});



let users = [];

const addUser = (userData, socketId) => {
    if (!users.find(user => user._id === userData._id)) {
        users.push({ ...userData, socketId });
    }
}
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}
const getUser = (userId) => {
    return users.find(user => user._id === userId);
}
io.on("connection", async (socket) => {
    console.log("user connected");
    socket.on("addUser", (userData) => {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
    })
    
    socket.on("newMessage", (data) => {
        const user = getUser(data.receiver_id);
        io.to(user?.socketId).emit('receiveNewMessage', data);
    })

    socket.on("deleteMessage", (data) => {
        const user = getUser(data.receiver_id);
        io.to(user?.socketId).emit('receiveDeleteMessage', data);
    })

    socket.on("profileChange", (data) => {
        socket.broadcast.emit("receiveProfileChange", data);
    })

    socket.on("Story", (data) => {
        socket.broadcast.emit("receiveStory", data);
    })

    socket.on('disconnect', async () => {
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
})

