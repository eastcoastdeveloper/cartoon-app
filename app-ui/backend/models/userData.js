const mongoose = require('mongoose');
const userData = mongoose.Schema({
    imageUrl: { type: String },
    altText: { type: String },
    totalCaptions: { type: Number },
    captions: { type: Array },
    cached: { type: Boolean },
    itemIndex: { type: Number },
    date: {type: Number}
});

module.exports = mongoose.model('Post', userData);