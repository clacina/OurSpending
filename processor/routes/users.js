import express from 'express';
var usersRouter = express.Router();


/* GET users listing. */
usersRouter.get('/', function(req, res, next) {
  res.send('users');
});

export default usersRouter;
