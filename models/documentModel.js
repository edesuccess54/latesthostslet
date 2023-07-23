const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    idType: {
        type: String,
        required: true,
        trim: true
    },

    country: {
        type: String,
        required: true,
        trim: true
    },

    doc: {
        type: Object,
        required: true
    },

    status: {
        type: Boolean,
        default: false,
        required: true
    },
}, {
    timestamps: true
});

const UserDocument = mongoose.model('document', documentSchema);

module.exports = UserDocument