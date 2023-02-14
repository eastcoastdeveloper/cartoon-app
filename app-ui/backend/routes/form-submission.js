const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const CaptionData = require('../models/userData'); 

router.use(bodyParser.json());

router.post('/', function (req, res, next) {
  const formData = new CaptionData({
    caption: req.body.caption,
    email: req.body.email,
    firstname: req.body.firstname,
    lastName: req.body.lastname,
    city: req.body.city,
    state: req.body.state
  })
  formData.save();
  res.status(201).json({
    message: 'Form submission added successfully'
  });
});

module.exports = router;