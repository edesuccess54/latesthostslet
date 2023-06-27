const { model, Schema } = require('mongoose')

const userSchema = Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    reserveCode: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['admin', 'user']
    },
    password: {
        type: String,
        required: true
    }
})

const User = model('User', userSchema)
module.exports = User