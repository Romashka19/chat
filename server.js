const express = require("express");
const socket = require("socket.io");
const mongoose = require('mongoose');
const router = express.Router();
const Router = require('./routes/messageRoutes.js');

const PORT = 3000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});


mongoose.connect('mongodb://localhost:27017/chat_db');
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Successfully connected to MongoDB!");
});

app.use(Router);


app.use(express.static("public"));
const io = socket(server);
const activeUsers = new Set();

io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        io.emit("new user", [...activeUsers]);
    });

    socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });

    socket.on("chat message", function (data) {
        io.emit("chat message", data);
    });

    socket.on("typing", function(data){
        socket.broadcast.emit("typing",data);
    });


});
