'use strict'

const express = require('express'),
    debug = require('debug')('avar:server'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser')
    
const app = express()

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const server = require('http').Server(app),
    io = require('socket.io')(server)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html')
})

io.on('connection', socket => {

    socket.on('Message.Send', user => {
        console.log(user)
        socket.broadcast.emit('Message.Receive', user)
    })
    
    socket.on('Channel.Quit', user => {
        console.log(user)
        socket.broadcast.emit('Channel.Quit', user.curr)
    })
    
    socket.on('Channel.Join', user => {
        console.log(user)
        socket.broadcast.emit('Channel.Join', user.curr)
    })
    
    socket.on('Nick.Changed', user => {
        console.log(user)
        socket.broadcast.emit('Nick.Changed', user)
    })
    
})

/**
 * Sets up the server and express app with error handlers
 */

const normalizePort = val => {
    let port = parseInt(val, 10)

    if (isNaN(port))
        return val
    else if (port >= 0)
        return port
    else
        return false
}

const onError = error => {
    if (error.syscall !== 'listen')
        throw error

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
}

const onListening = () => {
    let addr = server.address()
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    debug('Listening on ' + bind)
}

let port = normalizePort(process.env.PORT || '8080')
app.set('port', port)

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

app.use((err, req, res, next) => {
    console.log(err + ' ' + err.message)
})