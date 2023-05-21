const express = require('express');
const helmet = require('helmet');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const port = process.env.PORT || 8080;

const app = express();

mongoose.set("strictQuery", false);

mongoose.connect("mongodb+srv://uxdeveloper_DB:Jjn7i4ZDFrAPeeLT@cluster0.kndgbma.mongodb.net/test").then(() => {
}).then(() => {
  console.log('Connected to Database!')
})
  .catch(error => console.log(error));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(helmet());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();
});

app.use('/api/form-submission', require('./routes/form-submission'));
app.use('/api/captions', require('./routes/captions-process'));
app.use('/api/user', require('./routes/user'));
app.use('/api/init', require('./routes/init'));

module.exports = app;