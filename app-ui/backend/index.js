const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const CaptionData = require('./models/userData'); 
// const port = process.env.PORT || 8080;

mongoose.connect("mongodb+srv://uxdeveloper_DB:Jjn7i4ZDFrAPeeLT@cluster0.kndgbma.mongodb.net/?retryWrites=true&w=majority").then(() => {
  console.log('Connected to Database!')
}).catch(() => {
  console.log('Connected Failed');
});

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

// app.use('/api/getCaptions', require('./routes/approved-captions'));
app.use('/api/form-submission', require('./routes/form-submission'));

app.get('/api/getCaptions', (req, res, next) => {
  CaptionData.find()
    .then((documents) => {
      const currentDate = req.query.toonReference;
      const captionsGroupIndex = req.query.captionsGroupIndex;
      const pageLimit = req.query.pageLimit;
      const itemIndex = req.query.itemIndex;
      res.status(200).json({
        message: "Caption results fetch successfully",
        captions: documents
      })
    })
})

module.exports = app;