$(function() {
    $('.button-collapse').sideNav()
    $('.modal-trigger').leanModal()
});

var socket = io()
var currentChannel = "general"
var previousChannel = "general"

var currentNick = "Anonymous"
var previousNick = "Anonymous"

function getUser() {
    var user = {}
    user.prev = {
        nick: previousNick,
        channel: previousChannel
    }
    user.curr = {
        nick: currentNick,
        channel: currentChannel
    }
    return user
}

function makeNewMsg(dir, color, data) {
    return $('<li>')
        .append(
        $('<div>').attr('class', 'row')
            .append(
            $('<div>').attr('class', 'col s6 m6 ' + dir)
                .append(
                $('<div>').attr('class', 'card ' + color)
                    .append(
                    $('<div>').attr('class', 'card-content white-text')
                        .append(
                        $('<span>').attr('class', 'card-title').text(data.info.nick)
                        )
                        .append(
                        $('<p>').text(data.msg)
                        )
                    )
                )
            )
        )
}

function gotoTop() {
    window.scrollTo(0, 0)
}

function changeChannel() {
    console.log('Changing channel...')
    var channel = $('#channel').val()
    $('#channel').trigger('autoresize')
    $('#m').trigger('autoresize')

    channel = channel.replace('/\s+/g', '')
    if (channel.length === 0) return

    if (currentChannel === channel) {
        return
    } else {
        previousChannel = currentChannel
        currentChannel = channel
        notifyChannelQuit()
        notifyChannelJoin()
    }
    $('#channels').closeModal();

}

function changeNick() {
    console.log('Changing nick...')

    var nick = $('#nick').val()
    $('#nick').trigger('autoresize')
    $('#m').trigger('autoresize')

    nick = nick.replace('/\s+/g', '')
    if (nick.length === 0) return

    if (currentNick === nick) {
        return
    } else {
        previousNick = currentNick
        currentNick = nick
        notifyNameChange()
        Materialize.updateTextFields()
    }
    $('#nicks').closeModal();
}

function notifyNameChange() {
    socket.emit('Nick.Changed', getUser())
}

function notifyChannelQuit() {
    socket.emit('Channel.Quit', getUser())
}

function notifyChannelJoin() {
    socket.emit('Channel.Join', getUser())
}

$('#changeChannel').click(function() {
    $('#channels').openModal()
})


$('#changeNick').click(function() {
    $('#nicks').openModal()
})

$('#msg').submit(function() {

    var data = {}
    data.msg = $('#m').val()
    data.info = getUser().curr
    $('#messages').append(makeNewMsg('right', 'light-blue', data))
    $('#messages').append($('<br>'))

    window.scrollTo(0, document.body.scrollHeight)

    socket.emit('Message.Send', data)
    $('#m').val('')
    $('#m').trigger('autoresize')
    return false
})

socket.on('Message.Receive', function(user) {
    if (user.info.channel === currentChannel) {
        $('#messages').append(makeNewMsg('left', 'orange', user))
        $('#messages').append(
            $('<li>').append(
                $('<div>').attr('class', 'divider')
            )
        )
    }
})


socket.on('Channel.Quit', function(nick) {
    //addNewNotif
    console.log(nick + ' quit this channel')

})

socket.on('Channel.Join', function(nick) {
    //addNewNotif
    console.log(nick + ' joined this channel')

})

socket.on('Nick.Changed', function(nick) {
    //addNewNotif
    console.log(nick + ' joined this channel')

})

socket.on('Channel.Enter', function(nick) {
    //addNewNotif
    console.log(nick + ' joined this channel')

})