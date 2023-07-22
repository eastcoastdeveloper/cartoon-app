const express = require('express');
const router = express.Router();
const CaptionData = require('../models/userData');

function populateUI() {
    return (req, res, next) => {
        const query = req.query.toonReference;
        const results = {};
        let flag = req.query.flag;
        processQuery(req, res, flag, query, results, next);
    }
};

function processQuery(req, res, flag, query, results, next) {
    if (flag === 'true') {
        CaptionData.findOne({
            itemIndex: query
        }).then((doc) => {
            if (doc) {
                let captions = doc.captions;
                let filtered = captions.filter((item) => {
                    return item.approved === true
                })

                doc.captions = filtered;
                results.results = doc;
                res.populateUI = results;
                next();
            } else {
                const randomNumber = Math.floor(Math.random() * 5);
                processQuery(req, res, 'true', randomNumber, {}, next);
            }
        })
    }

    if (flag === 'false') {
        CaptionData.find({
            "captions.approved": false
        }).then((doc) => {
            for (var i = 0; i < doc.length; i++) {
                for (var j = 0; j < doc[i].captions.length; j++) {
                    if (doc[i].captions[j].approved) {
                        doc[i].captions = doc[i].captions.filter(
                            (item, index) => {
                                return doc[i].captions[index].approved === false;
                            }
                        );
                    }
                }
            }

            res.populateUI = doc;
            next();
        })
    }
}

router.get('/', populateUI(), (req, res) => {
    res.json(res.populateUI);
})

module.exports = router;