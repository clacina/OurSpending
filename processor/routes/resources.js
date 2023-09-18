var express = require('express');
var router = express.Router();

const request = require('request');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/banks', function(req, res, next) {
  const url = 'http://localhost:8080/institutions';

  request(url, (error, response, body) => {
    res.send(body);
  });
});




module.exports = router;
