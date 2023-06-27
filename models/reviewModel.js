const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    photo: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;