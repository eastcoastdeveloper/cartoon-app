const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    roles: {type: Object },
    password: { type: String, required: true },
    username: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    showLocation: {type: Boolean },
    location: {type: String },
    captions: { type: Array, required: false },
});

userSchema.plugin(uniqueValidator);
  
module.exports = mongoose.model("User", userSchema);