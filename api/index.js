const express = require('express');
const app = express();
const helmet = require('helmet');
const port = process.env.PORT || 8080;

app.use(helmet());

// Get Captions
app.use('/', require('./endpoints/submission-data'))

app.listen(port, (err) => {
  if (err) { console.log(err); }
  else {
    console.log(`listening on port ${port}`);
  }
})