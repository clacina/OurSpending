import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: "Processor - Authenticated Middleware",
    description: 'Middleware for communication between client front end and backend services.'
  },
  host: 'localhost:8000'
};

const outputFile = './public/swagger-output.json';
const routes = ['./routes/*.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);