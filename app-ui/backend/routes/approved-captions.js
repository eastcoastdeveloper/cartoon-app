const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData'); 

function populateUI() {
  return (req, res, next) => {
    // console.log(req)
    CaptionData.find()
    .then((documents) => {
      const currentDate = req.query.toonReference;
      const captionsGroupIndex = req.query.captionsGroupIndex;
      const pageLimit = req.query.pageLimit;
      const itemIndex = req.query.itemIndex;
      const results = {};
      
      results.results = documents.find((val) => {
        return val.date === parseInt(currentDate);
      })
    res.populateUI = results;
    next();
    })
  }
};

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;