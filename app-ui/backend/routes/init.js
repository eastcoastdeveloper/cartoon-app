const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData');

function cT() {
    return async (req, res, next) => {
        var query = CaptionData.find();
        var storageObject = {};

        await query.countDocuments({}).exec()
            .then((count) => {
            for (var i = 0; i < count; i++) {
                storageObject[i] = null;
            }
            res.cT = storageObject;
             next();
        }).catch((err) => {
            console.log(err)
        })
  }
};

router.get('/', cT(), (req, res) => {
  res.json(res.cT);
})

module.exports = router;