const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const CaptionData = require('../models/userData'); 
const checkAuth = require('../middleware/check-auth');

router.use(bodyParser.json());

router.post('/', checkAuth, async function (req, res, next) {
  const formData = {
    caption: req.body.formData.caption,
    firstname: req.body.formData.firstname,
    lastName: req.body.formData.lastname,
    city: req.body.formData.city,
    state: req.body.formData.state
  };
  const id = req.body.currentDataObject._id;
  await CaptionData.findOneAndUpdate(
    { _id: id },
    { $push: { captions: formData } 
  })
  res.status(201).json({
    message: 'Form submission added successfully'
  });
});

module.exports = router;