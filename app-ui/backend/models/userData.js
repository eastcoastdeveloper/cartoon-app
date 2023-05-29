const mongoose = require('mongoose');

const userData = mongoose.Schema({
  imageUrl: { type: String },
  altText: { type: String },
  captions: { type: Array },
  itemIndex: { type: Number }
});

module.exports = mongoose.model('Post', userData);