const mongoose = require('mongoose');

const propertySchema = mongoose.Schema({
    pname: {
        type: String,
        required: true
    },

    plocation: {
        type: String,
        required: true
    },

    pdistance: {
        type: String,
        required: true
    },

    pamount: {
        type: String,
        required: true
    },

    hostname: {
        type: String,
        required: true
    },

    guest: {
        type: String,
        required: true
    },

    bedroom: {
        type: String,
        required: true
    },

    bed: {
        type: String,
        required: true
    },

    bath: {
        type: String,
        required: true
    },

    rating: {
        type: String,
        required: true
    },

    review: {
        type: String,
        required: true
    },

    pcategory: {
        type: String,
        required: true
    },

    pimages: {
        type: Array,
        required: true
    }
}, {
    timestamps: true
})


const Property = mongoose.model('Property', propertySchema)
module.exports = Property