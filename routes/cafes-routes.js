const express = require('express');
const { check } = require('express-validator');

const cafesControllers = require('../controllers/cafes-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:id', cafesControllers.getCafeById);

router.get('/', cafesControllers.getCafes);

router.get('/city/:name', cafesControllers.getCafesByCity);

router.get('/user/:uid', cafesControllers.getCafesByUserId);

router.use(checkAuth);

router.post(
  '/',
  [
    check('name').not().isEmpty(),
    check('address').not().isEmpty(),
    check('city').not().isEmpty(),
    check('numOfSeats').not().isEmpty(),
    check('coffeeRating').not().isEmpty(),
    check('socketAvailability').not().isEmpty(),
    check('wifiStrength').not().isEmpty(),
    check('overallRating').not().isEmpty(),
  ],
  cafesControllers.createCafe
);

router.post(
  '/rating/:id',
  check('overallRating').not().isEmpty(),
  cafesControllers.rateCafe
);

router.patch(
  '/:id',
  [
    check('numOfSeats').not().isEmpty(),
    check('coffeeRating').not().isEmpty(),
    check('socketAvailability').not().isEmpty(),
    check('wifiStrength').not().isEmpty(),
  ],
  cafesControllers.updateCafe
);

router.delete('/:id', cafesControllers.deleteCafe);

module.exports = router;
