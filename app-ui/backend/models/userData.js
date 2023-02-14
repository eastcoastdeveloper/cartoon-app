const mongoose = require('mongoose');
const userData = mongoose.Schema({
    caption: { type: String, required: true },
    email: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String },
    city: { type: String },
    state: { type: String }
});

module.exports = mongoose.model('Post', userData);