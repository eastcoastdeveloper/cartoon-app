const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require("body-parser");
// const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(helmet());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use('/api/getCaptions', require('./routes/approved-captions'));
app.use('/api/form-submission', require('./routes/form-submission'));

module.exports = app;