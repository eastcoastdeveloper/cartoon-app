const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
  return (req, res, next) => {
    const query = req.query.toonReference;
    const results = {};
    let flag = req.query.flag;

    if (flag === 'true') {
      CaptionData.findOne({ itemIndex: query }).then((doc) => {
        let captions = doc.captions;
        let filtered = captions.filter((item) => {
          return item.approved === true
        })

        doc.captions = filtered;
        results.results = doc;
        res.populateUI = results;
        next();
      })
    }

    if (flag === 'false') {
      CaptionData.find({ "captions.approved": false }).then((doc) => {
        res.populateUI = doc;
        next();
      })
    }
  }
};

router.get('/', populateUI(), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;