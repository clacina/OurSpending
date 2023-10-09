import got from 'got';
import express from 'express';
var resourcesRouter = express.Router();
import request from 'request';

resourcesRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

resourcesRouter.get('/banks', function(req, res, next) {
  const url = 'http://localhost:8080/institutions';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/data_definitions', function(req, res, next) {
  const url = 'http://localhost:8080/transactions_descriptions';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/tags', function(req, res, next) {
  const url = 'http://localhost:8080/tags';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/categories', function(req, res, next) {
  const url = 'http://localhost:8080/categories';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/batches', function(req, res, next) {
  const url = 'http://localhost:8080/batches';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/processed_batches', function(req, res, next) {
  const url = 'http://localhost:8080/processed_batches';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/qualifiers', function(req, res, next) {
  const url = 'http://localhost:8080/qualifiers';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

/*
Template Model
{
   "id": 23,
   "institution": {
        "id": 4,
        "key": "WF",
        "name": "Wells Fargo"
    },
    "category": {
        "id": 34,
        "value": "Fee"
    },
    "qualifiers": [
        {
            "id": 24,
            "value": "ATM - "
        }
    ],
    "tags": [
        {
            "id": 9,
            "value": "Fee"
        }
    ],
    "credit": false,
    "hint": "ATM Withdrawal",
    "notes": "Fines and Penalties"
}

 */
resourcesRouter.get('/templates', function(req, res, next) {
  const url = 'http://localhost:8080/templates';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);

    // Loop through each template and fill in details??

    res.send(body);
  });
});


resourcesRouter.get('/transactions/:batch_id', function(req, res, next) {
  console.log("Params: ", req.params);
  const url = 'http://localhost:8080/transactions?batch_id=' + req.params['batch_id'];
  console.log("URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/processed_transactions/:batch_id', function(req, res, next) {
  console.log("Params: ", req.params);
  const url = 'http://localhost:8080/processed_transactions?batch_id=' + req.params['batch_id'];
  console.log("URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.post('/categories', async function(req, res, next) {
  req.accepts('application/json');
  const url = 'http://localhost:8080/categories';
  const options = {
    headers: {
      'Accept': 'application/json'
    },
    json: req.body
  }

  console.log("Data: ", options);
  try {
    const data = await got.post(url, options).json();
    res.status(201).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

resourcesRouter.put('/categories/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = 'http://localhost:8080/category/' + req.params['id'];

  const options = {
    headers: {
      'Accept': 'application/json'
    },
    json: req.body
  }

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


resourcesRouter.put('/tags/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = 'http://localhost:8080/tags/' + req.params['id'];
  console.log("URL: ", url);

  const options = {
    headers: {
      'Accept': 'application/json'
    },
    json: req.body
  }

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

resourcesRouter.post('/tags', async function(req, res, next) {
  req.accepts('application/json');
  const url = 'http://localhost:8080/tags';
  const options = {
    headers: {
      'Accept': 'application/json'
    },
    json: req.body
  }

  console.log("Data: ", options);
  try {
    const data = await got.post(url, options).json();
    res.status(201).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


resourcesRouter.put('/transaction/:id/tags', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = 'http://localhost:8080/transaction/' + req.params['id'] + '/tags';

  const options = {
    headers: {
      'Accept': 'application/json'
    },
    json: req.body
  }

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


resourcesRouter.put('/transaction/:id/notes', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.body);
  const url = 'http://localhost:8080/transaction/' + req.params['id'] + '/notes';

  const options = {
    headers: {
      'Accept': 'application/json'
    },
    json: req.body
  }

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


export default resourcesRouter;
