var mongoose = require('mongoose'); // Mongoose: Libreria para conectar con MongoDB

const MONGO_SERVER = process.env.MONGO_SERVER || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongo';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopwd';
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'mybusway';

var urlx = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DATABASE}`;
// var urlx = `mongodb://${MONGO_SERVER}:${MONGO_PORT}`;
console.log(urlx);

console.log(`MONGO_USERNAME = ${MONGO_USERNAME}`);
console.log(`MONGO_PASSWORD = ${MONGO_PASSWORD}`);
console.log(`MONGO_DATABASE = ${MONGO_DATABASE}`);

mongoose.connect(urlx, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    user: MONGO_USERNAME, // IMPORTANT TO HAVE IT HERE AND NOT IN CONNECTION STRING
    pass: MONGO_PASSWORD, // IMPORTANT TO HAVE IT HERE AND NOT IN CONNECTION STRING
    dbName: MONGO_DATABASE, // IMPORTANT TO HAVE IT HERE AND NOT IN CONNECTION STRING
  })
  .then(() => {console.log('connected');})
  .catch(error => {console.log(error);});


  