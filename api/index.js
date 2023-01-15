const express = require('express');
const app = express();
const helmet = require('helmet');
const port = process.env.PORT || 8080;

app.use(helmet());

app.use('/api/form-submission', require('./routes/form-submission'));
app.use('/api/get-captions', require('./routes/approved-captions'));
app.use('/api/update-caption-vote', require('./routes/update-caption-vote'));

app.listen(port, (err) => {
  if (err) { console.log(err); }
  else {
    console.log(`listening on port ${port}`);
  }
})