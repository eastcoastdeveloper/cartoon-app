const { count } = require('console');
const express = require('express');
const { type } = require('os');
const { post } = require('..');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
  return (req, res, next) => {
    const query = req.query.toonReference;
    const results = {};
    CaptionData.find().findOne({ itemIndex: query }, function (err, doc) {
      document = doc;
      results.results = document;
      res.populateUI = results;
      next();
    });
  }
};

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;