const mongoose = require('mongoose');

const userData = mongoose.Schema({
  imageUrl: { type: String },
  altText: { type: String },
  captions: { type: Array },
  itemIndex: { type: Number },
  location: { type: String }
});

module.exports = mongoose.model('Post', userData);