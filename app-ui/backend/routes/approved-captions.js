const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
  return (req, res, next) => {
    let newDocument;
    CaptionData.find()
    .then(async (documents) => {
      const currentDate = req.query.toonReference;
      // const captionsGroupIndex = req.query.captionsGroupIndex;
      // const pageLimit = req.query.pageLimit;
      // const itemIndex = req.query.itemIndex;
      const results = {};
      
      // Loading Initialization:
      // Search documents for matching date
      // If current date is not found, send random date
      for (var i = 0; i < documents.length; i++) {
        if (documents[i].date === parseInt(currentDate)) {
          results.results = documents[i];
          res.populateUI = results;
          next();
        }
      }

      if (JSON.stringify(results) === '{}') {
        var query = CaptionData.find();
        var allDocuments = await CaptionData.find({});
        query.count(function (err, count) {
          if (err) console.log(err);
          else {
            newDocument = allDocuments[Math.round(Math.random() * count)]; 
            results.results = newDocument;
            res.populateUI = results;
            next();
          }
        });
      }
    })
  }
};

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;