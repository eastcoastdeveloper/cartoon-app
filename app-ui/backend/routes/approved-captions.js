const express = require('express');
const { type } = require('os');
const { post } = require('..');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
  return (req, res, next) => {
    CaptionData.find()
    .then(async (documents) => {
      const currentDate = req.query.toonReference;
      // const captionsGroupIndex = req.query.captionsGroupIndex;
      // const pageLimit = req.query.pageLimit;
      // const itemIndex = req.query.itemIndex;
      const results = {};
      
      // Loading Initialization:
      for (var i = 0; i < documents.length; i++) {
        // Does the current date match a document?
        if (documents[i].date === parseInt(currentDate)) {
          results.results = documents[i];
          res.populateUI = results;
          next();
        }
        // Does entered date match a document?
        // Someone enters a URL...
      }
      
      // If current date or the entered date does not match a document
      // reverse in time to find nearest previous date / document
      if (JSON.stringify(results) === '{}') {
        var query = CaptionData.find();

        // Sort documents by date
        var allDocuments = await CaptionData.find({});
        allDocuments.sort((a,b) => a.date - b.date);

        query.count(function (err, count) {
          if (err) console.log(err);
          else {
            let d = new Date(),
              currentDay = d.getDate(),
              monthIndex = d.getMonth(),
              year = d.getFullYear(),
              fullDate,
              documentIndex = 0;
            
            for (; documentIndex < count; documentIndex++) {
              currentDay--;
              amountOfDaysInMonth = daysInMonth(monthIndex+1, year);
              for (var j = currentDay; j > 0; j--) {
                fullDate = parseInt( `${monthIndex}${j}${year}`);
                if (fullDate === allDocuments[documentIndex].date) {
                  results.results = allDocuments[documentIndex];
                  res.populateUI = results;
                }
              }
            }
            next();
          }
        });
      }
    })
  }
};

// Total Days in Month
function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;