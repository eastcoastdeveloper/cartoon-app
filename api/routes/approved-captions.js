const express = require('express');
const router = express.Router();
const projectData = require('../captions-data.json');

function populateCaptions(model) {
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};

    results.results = model.captions.slice(startIndex, endIndex);
    res.populateCaptions = results;
    next();
  }
}

router.get('/', populateCaptions(projectData), (req, res) => {
    res.json(res.populateCaptions);
})

module.exports = router;