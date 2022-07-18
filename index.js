'use strict';
require('dotenv').config();
var express = require('express'),
  app = express(),
  port = 5050,
  User = require('./models/userModels'),
  bodyParser = require('body-parser'),
  jsonwebtoken = require('jsonwebtoken');

const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.DATABASE_ACCESS, () =>
  console.log('Database is connected')
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'JWT'
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(' ')[1],
      'RESTFULAPIs',
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

app.use(
  cors({
    origin: '*',
  })
);

var routes = require('./routes/route');
routes(app);

app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

app.listen(port);

console.log(' RESTful API server started on: ' + port);

module.exports = app;
