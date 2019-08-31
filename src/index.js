require('dotenv').config()
const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count=0;
io.on('connection', (socket) => {
    console.log('New websocket connection')

    

    socket.on('join', ({ username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)


        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin' ,`${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        // console.log(message)
        const user = getUser(socket.id)

        if(user){
            const filter = new Filter();
            // console.log(filter.isProfane(message))
            if(filter.isProfane(message)){

                return callback('Profanity not allowed');
            }else{
                io.to(user.room).emit('message', generateMessage(user.username, message));
                callback()
            }
        }

        
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} got disconnected`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {

        const user = getUser(socket.id)

        if(user){
            const url = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        
            // console.log('we are in server '+url);
            // socket.broadcast.emit('message', url);
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
            callback()
        }

        
    })
})


server.listen(port, () => {
    console.log(`Application started on port ${port}`);
})
