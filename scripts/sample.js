var mongoose = require('mongoose'); // Mongoose: Libreria para conectar con MongoDB

const MONGO_SERVER = process.env.MONGO_SERVER || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongo';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopwd';
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'mybusway';

var urlx = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DATABASE}`;
console.log(urlx);

mongoose.connect(urlx, { useNewUrlParser: true, useUnifiedTopology: true  }).
then(() => {console.log('connected'); mongoose.disconnect();}).
  catch(error => handleError(error));


  