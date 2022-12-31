const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Get Captions
app.use('/', require('./endpoints/submission-data'))

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})