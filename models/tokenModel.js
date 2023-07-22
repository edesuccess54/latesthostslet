const mongoose = require('mongoose');

const Schema = mongoose.Schema

const tokenSchema =  new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
})

const Token = mongoose.model('token', tokenSchema)

module.exports = Token;