const mongoose = require('mongoose');
const userData = mongoose.Schema({
    caption: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    city: { type: String },
    state: { type: String }
});

module.exports = mongoose.model('Post', userData);