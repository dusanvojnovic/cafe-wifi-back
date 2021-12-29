const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');

const router = express.Router();

router.post(
  '/signup',
  [
    check('email').normalizeEmail().isEmail(),
    check('username').not().isEmpty(),
    check('password').isLength({ min: 6 }),
    check('confirmedPassword').not().isEmpty(),
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
