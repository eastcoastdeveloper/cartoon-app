const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());

router.post('/', function (req, res, next) {
  const formData = req.body;
  console.log(formData);
  res.status(201).json({
    message: 'Form submission added successfully'
  });
});

module.exports = router;