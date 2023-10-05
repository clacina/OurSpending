import express from 'express';
var reportsRouter = express.Router();
import request from 'request';


reportsRouter.get('/', (req, res, next) => {
  const url = 'http://localhost:8080/template/4';

  request(url, (error, response, body) => {
    console.log("Error: ", error);
    console.log("response: ", response && response.statusCode);
    console.log("body: ", body)
    res.send(body);
  });
});

export default reportsRouter;
