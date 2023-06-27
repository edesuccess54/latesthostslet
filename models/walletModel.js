const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    qrcode: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
})

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet