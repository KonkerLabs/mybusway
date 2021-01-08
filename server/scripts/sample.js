var mongoose = require('mongoose'); // Mongoose: Libreria para conectar con MongoDB
var fs = require('fs');

const MONGO_SERVER = process.env.MONGO_SERVER || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongo';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopwd';
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'mybusway';

const points = process.env.DATA_FILE; 

var urlx = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DATABASE}`;
// var urlx = `mongodb://${MONGO_SERVER}:${MONGO_PORT}`;
console.log(urlx);


// types 
var LineModel = require('../src/models/line');


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
  .then(() => {
    
    
    try {

      console.log('connected');

      // load data points 
      if (!points) {console.log('missing file'); process.exit(1);}
  
      fs.readFile(points, 'utf8', (err, jsondata) => {
        if (err) throw err;
        var data = JSON.parse(jsondata);

        data.map((pt) => {

          // console.log(pt.line);

          LineModel.findOne({name:pt.line}).then(docline => {

            if (!docline.stops) docline.stops = [];

            // check if stop already exists 
            var x =  docline.stops.reduce((t, docl) => {
              if (docl && parseInt(docl.name) == pt.no) {
                // console.log(`${pt.no} already exists`);
                return docl;
              } else { 
                return t ? t : null;
              }
            }, null);
            // not found 
            if (!x) {
              // need to create a new entry
              x = {line: pt.line, name:`§pt.no`, lat:pt.lat, long:pt.long, active:true};
              console.log(x);
            } else { 
              console.log(x);
              console.log('ALREADY EXISTS');
            }

            });
        });

        





      });
  
    } catch(err) {
      console.log(err);
    } finally {
      // mongoose.disconnect();
    }
  
  })
  .catch(error => {console.log(error);});


  