var express = require('express');
var router = express.Router();

const request = require('request');
const logger = require('../logger.js');


router.get('/', (req, res, next) => {
  logger.info("In Reports");
  // const url = 'https://jsonplaceholder.typicode.com/todos/1';
  const url = 'http://localhost:8080/template/4';

  request(url, (error, response, body) => {
    console.log("Error: ", error);
    console.log("response: ", response && response.statusCode);
    console.log("body: ", body)
    res.send(body);
  });
});

module.exports = router;
