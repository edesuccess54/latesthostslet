const mongoose = require('mongoose')

const checkinSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    amount: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    checkins: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

const Checkin = mongoose.model('checkin', checkinSchema)

module.exports = Checkin