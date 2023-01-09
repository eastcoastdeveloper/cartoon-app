const express = require('express');
const router = express.Router();
const projectData = require('../dummy-data.json');

// Populate UI
function populateUI(model) {
  return (req, res, next) => {
    // const results = {};
    results = model;
    res.populateUI = results;
    next();
  }
}

// Home Page Route
router.use('/', populateUI(projectData), (req, res) => {
  res.json(res.populateUI);
})

module.exports = router;