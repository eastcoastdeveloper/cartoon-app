const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());

router.post('/', function (req, res, next) {
    console.log('New vote recorded')
    console.log(req.body);
    // res.json(req.body);
});

module.exports = router;