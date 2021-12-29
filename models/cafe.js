const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cafeShcema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  numOfSeats: { type: String, required: true },
  coffeeRating: { type: String, required: true },
  socketAvailability: { type: String, required: true },
  wifiStrength: { type: String, required: true },
  overallRating: [{ type: Number, required: true }],
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Cafe', cafeShcema);
