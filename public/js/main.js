$(function() {
    $('.button-collapse').sideNav({
        closeOnClick: true
    })
    $('.modal-trigger').leanModal()
})

var socket = io()
var currentChannel = "general"
var previousChannel = "general"

var currentNick = "Anonymous"
var previousNick = "Anonymous"

var welcomeStr = "Hello Anon! Welcome to Krikey, the privacy oriented chat app (We swear ;) )\n You can use the menu on the side (if you are on mobile) or the top to change your name and your channel. Have fun! Enjoy your stay!"

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

function makeNewMsg(dir, color, data, type) {
    return $('<li>').attr('class', 'msg ')
        .append(
        $('<div>').attr('class', 'row')
            .append(
            $('<div>').attr('class', 'col s6 m6 ' + dir)
                .append(
                $('<div>').attr('class', 'card ' + color)
                    .append(
                    $('<div>').attr('class', 'card-content white-text')
                        .append(
                        $('<span>').attr('class', 'card-title flow-text ' + type).text(data.info.nick)
                        )
                        .append(
                        $('<p>').text(data.msg)
                        )
                    )
                )
            )
        )
}

function welcomeMsg() {
    return $('<li>')
        .append(
        $('<div>').attr('class', 'row welcome')
            .append(
            $('<div>').attr('class', 'col s12 m12 center')
                .append(
                $('<div>').attr('class', 'card-panel light-blue')
                    .append(
                    $('<span>').attr('class', 'white-text flow-text').text(welcomeStr)
                    )
                )
            )
        )
}

function gotoTop() {
    window.scrollTo(0, 0)
}

function deleteMessages() {
    $('.msg').fadeOut()
    $('.msg').remove()
}

function changeChannel() {
    console.log('Changing channel...')
    var channel = prompt('Enter new channel', previousChannel);
    console.log(channel)

    if (channel != null) {
        channel = channel.replace('/\s+/g', '_')
        if (currentChannel === channel) {
            return
        } else {
            previousChannel = currentChannel
            currentChannel = channel
            notifyChannelJoin()
            notifyChannelQuit()
            $('#channel-name').text(currentChannel)
            addNewNotif('You changed your channel to ' + currentChannel)
        }
    }
}

function changeNick() {
    console.log('Changing nick...')
    var nick = prompt('Enter new nick', previousNick);

    if (nick != null) {
        nick = nick.replace('/\s+/g', '_')
        if (currentNick === nick) {
            return
        } else {
            previousNick = currentNick
            currentNick = nick
            addNewNotif('You changed your nick to ' + currentNick)
            notifyNameChange()
            $('.me').text(currentNick)
        }
    }
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

$('#msg').submit(function() {

    var data = {}
    data.msg = $('#m').val()
    data.info = getUser().curr

    if ($('.welcome').length > 0)
        $('.welcome').remove()

    $('#messages').append(makeNewMsg('right', 'light-blue', data, 'me'))
    $('#messages').append(
        $('<li>').append(
            $('<br>')
        )
    )
    window.scrollTo(0, document.body.scrollHeight)

    socket.emit('Message.Send', data)
    $('#m').val('')
    $('#m').trigger('autoresize')
    return false
})

socket.on('Message.Receive', function(user) {
    if (user.info.channel === currentChannel) {

        if ($('.welcome').length > 0)
            $('.welcome').remove()

        $('#messages').append(makeNewMsg('left', 'orange', user, ''))
        $('#messages').append(
            $('<li>').append(
                $('<br>')
            )
        )
        window.scrollTo(0, document.body.scrollHeight)
    }
})

socket.on('Channel.Quit', function(nick) {
    addNewNotif(nick.nick + ' quit this channel')
})

socket.on('Channel.Join', function(nick) {
    addNewNotif(nick.nick + ' joined this channel')
})

socket.on('Nick.Changed', function(nick) {
    addNewNotif(nick.prev.nick + ' is now ' + nick.curr.nick)
})

socket.on('User.Welcome', function() {
    $('#messages').append(welcomeMsg())
})

function addNewNotif(info) {
    Materialize.toast(info, 2500)
    console.log(info)
}