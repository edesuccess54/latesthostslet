const mongoose = require('mongoose')

const checkinSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    property: {
        type: mongoose.Schema.Types.ObjectId,
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

    checkins: {
        type: String,
        required: true
    },

    checkindate: {
        type: String,
        required: true
    },

    checkoutdate: {
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