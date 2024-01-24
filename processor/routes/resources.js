import got from 'got';
import express from 'express';
var resourcesRouter = express.Router();
import request from 'request';
import "dotenv/config.js";

const standardOptions = (body) => {
  return {
    'Accept': 'application/json',
    'json': body
  }
}


resourcesRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

resourcesRouter.get('/banks', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/institutions';
  console.log("Banks URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.put('/bank/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/institution/' + req.params['id'];

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

resourcesRouter.get('/data_definitions', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/transactions_descriptions';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/tags', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/tags';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/categories', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/categories';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/batches', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/batches';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.get('/processed_batches', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/processed_batches';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.post('/processed_batch/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/processed_batch/' + req.params['id'];

  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.post(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

resourcesRouter.get('/processed_batch/:id', async function(req, res, next) {
  req.accepts('application/json');
  const url = process.env.REACT_APP_REST_SERVER + '/processed_batch/' + req.params['id'];

  try {
    const data = await got.get(url).json();
    res.status(200).send(data);
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


resourcesRouter.delete('/processed_batch/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/processed_batch/' + req.params['id'];

  try {
    await got.delete(url);
    res.status(204).send("");
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters deleting batch " + req.params['id']);
  }
});


resourcesRouter.get('/qualifiers', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/qualifiers';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});


resourcesRouter.get('/templates', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/templates';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.put('/template/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/template/' + req.params['id'];

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

resourcesRouter.patch('/template/:id', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/template/' + req.params['id'];

  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.patch(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});


resourcesRouter.get('/transactions/:batch_id', function(req, res, next) {
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/transactions?batch_id=' + req.params['batch_id'] + "&limit=3000";
  console.log("URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});


resourcesRouter.get('/transactions/:batch_id/:institution_id', function(req, res, next) {
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/transactions?batch_id=' + req.params['batch_id'] + "&institution_id=" + institution_id + "&limit=3000";
  console.log("URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);
    res.send(body);
  });
});


resourcesRouter.get('/processed_transactions/:batch_id', function(req, res, next) {
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/processed_transactions?limit=3000&batch_id=' + req.params['batch_id'];
  console.log("URL: ", url);

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body.length);
    console.log("Request errors: ", error);
    res.send(body);
  });
});

resourcesRouter.post('/categories', async function(req, res, next) {
  req.accepts('application/json');
  const url = process.env.REACT_APP_REST_SERVER + '/categories';
  const options = standardOptions(req.body);

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
  const url = process.env.REACT_APP_REST_SERVER + '/category/' + req.params['id'];

  const options = standardOptions(req.body);

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
  const url = process.env.REACT_APP_REST_SERVER + '/tags/' + req.params['id'];
  console.log("URL: ", url);

  const options = standardOptions(req.body);

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
  const url = process.env.REACT_APP_REST_SERVER + '/tags';
  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.post(url, options).json();
    res.status(201).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

// --------------------------------- Transaction Tags ------------------------------

resourcesRouter.put('/transaction/:id/tags', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.params);
  const url = process.env.REACT_APP_REST_SERVER + '/transaction/' + req.params['id'] + '/tags';

  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

// --------------------------------- Transaction Notes ------------------------------

resourcesRouter.post('/transaction/:id/notes', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.body);
  const url = process.env.REACT_APP_REST_SERVER + '/transaction/' + req.params['id'] + '/notes';

  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.post(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

resourcesRouter.put('/transaction/:id/notes', async function(req, res, next) {
  req.accepts('application/json');
  console.log("Params: ", req.body);
  const url = process.env.REACT_APP_REST_SERVER + '/transaction/' + req.params['id'] + '/notes';

  const options = standardOptions(req.body);

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options).json();
    res.status(200).send(data);
  } catch (e) {
    // console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

// --------------------------------- Transaction Category ------------------------------

resourcesRouter.put('/transaction/:id/category', async function(req, res, next) {
  req.accepts('application/json');
  const url = process.env.REACT_APP_REST_SERVER + '/transaction/' + req.params['id'] + '/category?category_id=' + req.body['category_id'];
  console.log("URL: ", url);
  const options = {
    headers: {
      'Accept': 'application/json'
    }
  }

  console.log("Data: ", options);
  try {
    const data = await got.put(url, options);
    console.log("Data: ", data.body);
    res.status(200).send(data.body);
  } catch (e) {
    console.log("Got Error: ", e);
    res.status(422).send("Invalid Parameters");
  }
});

resourcesRouter.get('/saved_filters', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/saved_filters';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);

    res.send(body);
  });
});

resourcesRouter.get('/batch_contents', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/batch_contents';

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);

    res.send(body);
  });
});

resourcesRouter.get('/batch_contents/:batch_id', function(req, res, next) {
  const url = process.env.REACT_APP_REST_SERVER + '/batch_contents/' + req.params['batch_id'];

  request(url, (error, response, body) => {
    console.debug("Sending back: ", body);
    console.log("Request errors: ", error);

    res.send(body);
  });
});


export default resourcesRouter;
