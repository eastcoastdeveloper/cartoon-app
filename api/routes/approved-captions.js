const express = require('express');
const router = express.Router();
const projectData = require('../captions-data.json');

function populateUI(model) {
      return (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = {};
    
        results.results = model.captions;

        console.log(results)
        res.populateUI = results;
        next();
      }
}

router.get('/', populateUI(projectData), (req, res) => {
    res.json(res.populateUI);
})

module.exports = router;