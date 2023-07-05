const mongoose = require('mongoose');

const codeSchema = mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    code: {
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

const Code = mongoose.model('code', codeSchema)
module.exports = Code