const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
  return (req, res, next) => {
    const query = req.query.toonReference;
    const results = {};
    CaptionData.find().findOne({ itemIndex: query }).then((doc) => {
      results.results = doc;
      res.populateUI = results;
      next();
    })
  }
};

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;