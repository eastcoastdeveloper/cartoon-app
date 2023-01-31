const express = require('express');
const app = express();
const helmet = require('helmet');
const port = process.env.PORT || 8080;

app.use(helmet());

app.use('/api/getCaptions', require('./routes/approved-captions'));
app.use('/api/form-submission', require('./routes/form-submission'));

module.exports = app;