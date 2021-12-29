const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true, minLength: 6 },
  cafes: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Cafe' }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
