const { count } = require('console');
const express = require('express');
const { type } = require('os');
const { post } = require('..');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
  return (req, res, next) => {
    CaptionData.find()
      .then(async (documents) => {
        const itemQuery = req.query.toonReference;
        const count = documents.length;
        const results = {};

        // Query is Null
        if (!JSON.parse(itemQuery)) {
          const randomNumber = Math.floor(Math.random() * count);
          results.results = documents[randomNumber];
          res.populateUI = results;
          next();
        }

        if (null != JSON.parse(itemQuery)) {
          let nextDocument = documents.filter((doc) => {
            if (doc.itemIndex === parseInt(itemQuery)) {
              return doc
            }
          })

          results.results = nextDocument;
          results.total = count
          results.populateUI = results;
          next()
        }

    })
  }
};

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;