import express from 'express';
var indexRouter = express.Router();

indexRouter.get('/', function(req, res, next) {
  res.send({ title: 'Express' });
});

export default indexRouter;
