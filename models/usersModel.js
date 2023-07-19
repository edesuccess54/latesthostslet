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
        // required: true
    },

    gender: {
        type: String,
        // required: true
    },
     country: {
        type: String,
        // required: true
    },
     
     ip: {
        type: String,
        // required: true
    },
     
    lastseen: {
        type: String,
    },

    reference: {
        type: String,
        // required: true
    },

    profit: {
        type: String,
        default: '0.00',
        // required: true
    },

    host: {
        type: Boolean,
        required: true,
        default: false,
    },

    picture: {
        type: Object,
    },

    status: {
        type: Boolean,
        required: true,
        default: false
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