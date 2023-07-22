const mongoose = require('mongoose');

const propertySchema = mongoose.Schema({
    pname: {
        type: String,
        required: true,
        trim: true
    },

    plocation: {
        type: String,
        required: true,
        trim: true
    },

    pdistance: {
        type: String,
        required: true,
        trim: true
    },

    pamount: {
        type: String,
        required: true,
        trim: true
    },

    // hostname: {
    //     type: String,
    //     required: true
    // },

    guest: {
        type: String,
        required: true,
        trim: true
    },

    bedroom: {
        type: String,
        required: true,
        trim: true
    },

    bed: {
        type: String,
        required: true,
        trim: true
    },

    bath: {
        type: String,
        required: true,
        trim: true
    },

    rating: {
        type: String,
        required: true,
        trim: true
    },

    review: {
        type: String,
        required: true,
        trim: true
    },

    pcategory: {
        type: String,
        required: true,
        trim: true
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