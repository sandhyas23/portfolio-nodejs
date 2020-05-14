const express = require('express');
const router = express.Router();

userDb = require('../models/userModel')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
