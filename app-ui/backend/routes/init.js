const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData');

function cT() {
    return (req, res, next) => {
        var query = CaptionData.find();
        var storageObject = {};
        query.count(function (err, count) {
            if (err) console.log(err)
            else {
                for (var i = 0; i < count; i++) {
                    storageObject[i] = null;
                }
                res.cT = storageObject;
                next();
            }
        });
  }
};

router.get('/', cT(), (req, res) => {
  res.json(res.cT);
})

module.exports = router;