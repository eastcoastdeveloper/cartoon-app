const express = require('express');
const app = express();
const helmet = require('helmet');
const projectData = require('./captions-data.json');
const port = process.env.PORT || 8080;

app.use(helmet());

/* ############################## */
/*        Get Captions            */
/* ############################## */
function captionsRequest(model) {
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};

    results.results = model.data.slice(startIndex, endIndex);
    res.captionsRequest = results;
    next();
  }
}

app.use('/api/form-submission', require('./routes/form-submission'));
app.use('/api/update-caption-vote', require('./routes/update-caption-vote'));



app.use('/api/getCaptions', captionsRequest(projectData), (req, res) => {
  res.json(res.captionsRequest);
})

app.listen(port, (err) => {
  if (err) { console.log(err); }
  else {
    console.log(`listening on port ${port}`);
  }
})