const express = require('express');
const app = express();
// const dummyData = require('./dummyData.json');
const port = process.env.PORT || 8080;

function populateUI(model) {
  return (req, res, next) => {
    console.log('dummy data sent to UI from server!')
    next();
  }
}

// app.use('/api', populateUI(dummyData), (req, res) => {
//   res.json(res.populateUI);
// })

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})