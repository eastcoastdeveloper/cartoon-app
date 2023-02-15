const express = require('express');
const router = express.Router();
const projectData = require('../captions-data.json');

function populateUI(model) {

  return (req, res, next) => {
    const toonReference = req.query.toonReference;
    const captionsGroupIndex = parseInt(req.query.captionsGroupIndex);
    const pageLimit = parseInt(req.query.pageLimit);
    const startIndex = (captionsGroupIndex - 1) * pageLimit;
    const endIndex = captionsGroupIndex * pageLimit;
    const results = {};

    results.results = model.userData.find((val) => {
      return val.objectID === toonReference;
    })

    // results.results = model.userData;
    res.populateUI = results;
    next();
  }
}

router.get('/', populateUI(projectData), (req, res) => {
    res.json(res.populateUI);
})

module.exports = router;

/* 

router.use(bodyParser.json());

router.post('/', function (req, res, next) {
  const formData = new CaptionData({
    caption: req.body.caption,
    email: req.body.email,
    firstname: req.body.firstname,
    lastName: req.body.lastname,
    city: req.body.city,
    state: req.body.state
  })
  formData.save();
  res.status(201).json({
    message: 'Form submission added successfully'
  });
});

module.exports = router;
*/