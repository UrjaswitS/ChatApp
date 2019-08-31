const socket = io()


// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkTemplate = document.querySelector('#message-template-link').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })


const autoscroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Container height
    const containerHeight = messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}


messageForm.addEventListener('submit', (event) => {

    event.preventDefault();
    messageFormButton.setAttribute('disabled', 'disabled')
    const text = event.target.elements.message.value;
    // console.log(text)

    socket.emit('sendMessage', text, (error) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }else{
            console.log('message was delivered ')
        }
    })
})

sendLocationButton.addEventListener('click', ()  => {
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }
    sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        // console.log(position.coords.latitude+" "+position.coords.longitude)
    
        socket.emit(
            'sendLocation', 
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, 
            () => {
                console.log('Location Shared')
                sendLocationButton.removeAttribute('disabled')
            })
    
    })
})




socket.on('locationMessage', (message) => {    
    // console.log('in client', url);

    const html = Mustache.render(linkTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('message', (msg) => {
    // console.log(msg);

    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
});