const express = require('express');
const { type } = require('os');
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
      // If current date is not found, send random document
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
            let d = new Date(),
              currentDay = d.getDate(),
              monthIndex = d.getMonth(),
              year = d.getFullYear(),
              fullDate,
              documentIndex = 0;
            
            while (currentDay > 1) {
              currentDay--;
              fullDate = parseInt(`${monthIndex}${currentDay}${year}`);
              if (fullDate === allDocuments[documentIndex].date) {
                results.results = allDocuments[documentIndex];
                console.log(fullDate);
                console.log(allDocuments[documentIndex].date)
                res.populateUI = results;
                break;
              }
            }
            next();
          }
        });
      }
    })
  }
};

function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}

// function reverseInTime() {
//   let d = new Date(),
//     currentDay = d.getDate(),
//     monthIndex = d.getMonth(),
//     year = d.getFullYear(),
//     fullDate;
  
//   currentDay--;  
//   fullDate = `${monthIndex}${currentDay}${year}`;
//   return fullDate
// }

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;