const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Get Submission List/ Scrolling Data
app.use('/', require('./endpoints/submission-data'))

app.listen(port, () => {
  console.log(`listening on port ${port}!!!!`);
})