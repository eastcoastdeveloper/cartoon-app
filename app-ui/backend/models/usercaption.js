const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const userCaptionSchema = mongoose.Schema({
  imageUrl: { type: String },
  caption: { type: String },
  id: { type: String },
  status: { type: String }
});

// userCaptionSchema.plugin(uniqueValidator);
  
module.exports = mongoose.model("Caption", userCaptionSchema);