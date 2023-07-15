const express = require("express");
const UserSchema = require("../models/users");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const lat = req.query.lat;
  const long = req.query.long;

  var fetch = require('node-fetch');
  var requestOptions = {
    method: 'GET',
  };

  fetch(`http://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=4cf8de2fb2854397bd3ec04d120268a4`, requestOptions)
    .then(response => response.json())
    .then(result => res.status(200).send({result: result.features[0]}))
    .catch(error => console.log('error', error));
})


module.exports = router;
