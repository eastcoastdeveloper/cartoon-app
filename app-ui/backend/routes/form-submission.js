const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const CaptionData = require('../models/userData'); 
const checkAuth = require('../middleware/check-auth');

router.use(bodyParser.json());

router.post('/', checkAuth, function (req, res, next) {
  const formData = new CaptionData({
    caption: req.body.caption,
    email: req.body.email,
    firstname: req.body.firstname,
    lastName: req.body.lastname,
    city: req.body.city,
    state: req.body.state
  })
  console.log(formData)
  formData.save();
  res.status(201).json({
    message: 'Form submission added successfully'
  });
});

module.exports = router;