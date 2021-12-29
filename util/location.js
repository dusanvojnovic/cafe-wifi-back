const axios = require('axios');
const HttpError = require('../models/http-error');
const API_KEY = 'pk.5a52543dc86c6d2eeb22c295bc49d98e';

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(
      address
    )}&format=json`
  );

  const data = response.data[0];

  console.log(data);

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    );
    throw error;
  }

  const coordinates = {
    lat: data.lat,
    lng: data.lon,
  };

  return coordinates;
}

module.exports = getCoordsForAddress;
