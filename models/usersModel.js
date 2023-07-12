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
    number: {
        type: String,
    },

    reserveCode: {
        type: String,
        required: true
    },

    profit: {
        type: String,
        default: '0.00',
        required: true
    },

    host: {
        type: Boolean,
        required: true,
        default: false,
    },

    picture: {
        type: Object,
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