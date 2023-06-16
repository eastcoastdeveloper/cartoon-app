const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    username: { type: String, required: true },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    showLocation: { type: Boolean, required: false },
    showCountry: { type: Boolean, required: false },
    captions: { type: Array, required: false },
    roles: {type: Object }
});

userSchema.plugin(uniqueValidator);
  
module.exports = mongoose.model("User", userSchema);