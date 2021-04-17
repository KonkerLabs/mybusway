/*jshint esversion: 6 */
const swaggerAutogen = require('swagger-autogen')();
const outputFile = './src/swagger.json';
const endpointsFiles = [
  './src/index.js'
];

const doc = {
  info: {
      version: "2.1.0",
      title: "RDX Projac",
      description: "RDX API for Projac"
  },
  tags: [
    {"name": "auth", "description": "used to authenticate and authorize user access on the platform, when required"},
    {"name": "bus", "description": "bus API used to get information regarding the vehichle and setting it's current usage"},
    {"name": "line", "description": "line information - creation, update"},
    {"name": "user", "description": "user information - used for some roles like admin and driver"}
  ],
  host: process.env.SWAGGER_URL || 'localhost:8080', 
  basePath: "/",
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./index.js');
});