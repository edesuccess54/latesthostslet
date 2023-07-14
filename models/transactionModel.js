const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    propertyReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },

    unitAmount: {
        type: String,
        trim: true
    },
    
    amount: {
        type: Number,
        required: true,
        trim: true
    },
    method: {
        type: String,
        required: true,
        trim: true
    },
    proof: {
        type: String,
    },
    transactionType: {
        type: String,
        default: 'Deposit',
        enum: ['Deposit', 'Withdrawal'],
        trim: true
    },
    wallet: {
        type: String,
        trim: true
    },

    status: {
        type: Boolean,
        required: true,
        default: false,
        trim: true
    },

    statusMessage: {
        type: String,
    },

    datetime: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Transaction = mongoose.model('transaction', transactionSchema)

module.exports = Transaction