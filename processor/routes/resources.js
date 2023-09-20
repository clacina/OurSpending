var express = require('express');
var router = express.Router();

const request = require('request');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/banks', function(req, res, next) {
  const url = 'http://localhost:8080/institutions';

  request(url, (error, response, body) => {
    console.log("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

router.get('/data_definitions', function(req, res, next) {
  const url = 'http://localhost:8080/transactions_descriptions';

  request(url, (error, response, body) => {
    console.log("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

router.get('/tags', function(req, res, next) {
  const url = 'http://localhost:8080/tags';

  request(url, (error, response, body) => {
    console.log("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

router.get('/categories', function(req, res, next) {
  const url = 'http://localhost:8080/categories';

  request(url, (error, response, body) => {
    console.log("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});


module.exports = router;
