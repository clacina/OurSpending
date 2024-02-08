import got from 'got';
import express from 'express';
var actionsRouter = express.Router();
import request from 'request';
import "dotenv/config.js";

const standardOptions = (body) => {
  return({
    headers: {
      'Accept': 'application/json'
    },
    json: body
  });
}


actionsRouter.get('/', function(req, res, next) {
  res.send('respond with an action record.');
});

/*
actionsRouter.get('/banks', function(req, res, next) {
  const url = process.env.REACT_APP_DATA_PROCESSING + '/institutions';
  console.log("Banks URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

actionsRouter.put('/bank/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_DATA_PROCESSING + '/institution/' + req.params['id'];

  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

*/

actionsRouter.post('/batch/:id/process', async function(req, res, next) {
  /*
    Process an existing transaction_batch into a new processed_batch
   */
  req.accepts('application/json');
  console.log("Params: ", req.params);
  console.log("Body: ", req.body);
  const body = {
    ...req.body,
    "batch_id": req.params['id']
  }
  const url = process.env.REACT_APP_DATA_PROCESSING + '/process';
  const options = standardOptions(body);
  console.log("Data: ", options);

  try {
    const data = await got.post(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


export default actionsRouter;
