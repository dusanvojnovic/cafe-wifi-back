const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddres = require('../util/location');
const Cafe = require('../models/cafe');
const User = require('../models/user');

const getCafes = async (req, res, next) => {
  let cafes;
  try {
    cafes = await Cafe.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching cafes faild, please try again later',
      500
    );
    return next(error);
  }

  res.json({ cafes: cafes.map((cafe) => cafe.toObject({ getters: true })) });
};

const getCafesByCity = async (req, res, next) => {
  const cityName = req.params.name;

  let cafes;
  try {
    cafes = await Cafe.find({ city: cityName });
  } catch (err) {
    const error = new HttpError('Could not find cafes for this city', 500);
    return next(error);
  }

  if (!cafes) {
    const error = new HttpError('Could not find any cafe for that city', 404);
    return next(error);
  }

  res.json({ cafes: cafes.map((cafe) => cafe.toObject({ getters: true })) });
};

const getCafeById = async (req, res, next) => {
  const cafeId = req.params.id;

  let cafe;
  try {
    cafe = await Cafe.findById(cafeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a cafe.',
      500
    );
    return next(error);
  }

  if (!cafe) {
    const error = new HttpError(
      'Could not find a cafe for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ cafe: cafe.toObject({ getters: true }) });
};

const getCafesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithCafes;
  try {
    userWithCafes = await User.findById(userId).populate('cafes');
  } catch (err) {
    const error = new HttpError('Fetching cafes failed, please try later', 500);
    return next(error);
  }

  if (!userWithCafes || userWithCafes.cafes.length === 0) {
    return next(
      new HttpError('Could not find cafes for the provided user id.', 404)
    );
  }

  res.json({
    cafes: userWithCafes.cafes.map((cafe) => cafe.toObject({ getters: true })),
  });
};

const createCafe = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  const {
    name,
    address,
    city,
    numOfSeats,
    coffeeRating,
    socketAvailability,
    wifiStrength,
    overallRating,
  } = req.body;

  // const fullAddress = address + ', ' + city;

  let coordinates;
  try {
    coordinates = await getCoordsForAddres(`${address} ${city}`);
  } catch (error) {
    return next(error);
  }

  const createdCafe = new Cafe({
    name,
    address,
    city,
    location: coordinates,
    numOfSeats,
    coffeeRating,
    socketAvailability,
    wifiStrength,
    overallRating,
    creator: req.userData.userId,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating cafe failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdCafe.save({ session: session });
    user.cafes.push(createdCafe);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating cafe failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ cafe: createdCafe });
};

const updateCafe = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { numOfSeats, coffeeRating, socketAvailability, wifiStrength } =
    req.body;

  const cafeId = req.params.id;

  let cafe;
  try {
    cafe = await Cafe.findById(cafeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a cafe.',
      500
    );
    return next(error);
  }

  if (cafe.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this cafe.', 401);
    return next(error);
  }

  cafe.numOfSeats = numOfSeats;
  cafe.coffeeRating = coffeeRating;
  cafe.socketAvailability = socketAvailability;
  cafe.wifiStrength = wifiStrength;

  try {
    await cafe.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update cafe',
      500
    );
    return next(error);
  }

  res.status(200).json({ cafe: cafe.toObject({ getters: true }) });
};

const rateCafe = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid data passed, something went wrong', 422)
    );
  }

  const cafeId = req.params.id;
  const { overallRating } = req.body;

  let cafe;
  try {
    cafe = await Cafe.findById(cafeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again', 500);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    cafe.overallRating.push(overallRating);
    await cafe.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Rating cafe failed, please try again later',
      500
    );
    return next(error);
  }

  res.status(201).json({ cafe: cafe.toObject({ getters: true }) });
};

const deleteCafe = async (req, res, next) => {
  const cafeId = req.params.id;

  let cafe;
  try {
    cafe = await Cafe.findById(cafeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete cafe',
      500
    );
    return next(error);
  }

  if (!cafe) {
    const error = new HttpError('Could not find cafe for this id.', 404);
    return next(error);
  }

  if (cafe.creator.id !== req.userData.userId) {
    const error = new HttpError('You are not allowed to delete this cafe', 401);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await cafe.remove({ session: session });
    cafe.creator.cafes.pull(cafe);
    await cafe.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete cafe',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Cafe deleted.' });
};

exports.getCafes = getCafes;
exports.getCafeById = getCafeById;
exports.getCafesByUserId = getCafesByUserId;
exports.getCafesByCity = getCafesByCity;
exports.createCafe = createCafe;
exports.updateCafe = updateCafe;
exports.rateCafe = rateCafe;
exports.deleteCafe = deleteCafe;
