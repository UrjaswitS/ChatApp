const users = []

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if( !username || !room ){
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = ( id ) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = ( id ) => {
    return users.find((user) => user.id === id)

}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

addUser({
    id: 3344,
    username: 'Urja  ',
    room: 'Home'
})
addUser({
    id: 3345,
    username: 'Mike',
    room: 'Home'
})
addUser({
    id: 3346,
    username: 'Urja  ',
    room: 'Office'
})

// const u = removeUser(3344)

console.log(getUser(344))
console.log(getUsersInRoom('ofice'))

// console.log(u);
console.log(users)