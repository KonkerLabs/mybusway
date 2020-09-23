/*jshint esversion: 6 */

var express = require('express');
var dotenv = require('dotenv');
var app = express();
var conversion = require('./aux.js');

var konker = require('./api/konker.js');
var md5 = require('md5');
var fs = require('fs');

// load configuration environment from dotenv
dotenv.config();

konker.api.login(process.env.KONKER_API_TOKEN);
konker.api.setApplication(process.env.KONKER_APPLICATION);

const DEBUG_MODE_CACHED_POSITIONS = conversion.parseBool(process.env.DEBUG_MODE_CACHED_POSITIONS);

console.log('---------------');
console.log(`Registering server with application KONKER_APPLICATION="${process.env.KONKER_APPLICATION}"`);
console.log(`using API TOKEN ... KONKER_API_TOKEN= ${process.env.KONKER_API_TOKEN}`);
console.log(`using ${DEBUG_MODE_CACHED_POSITIONS ? 'DEBUG' : 'PRODUCTION'} MODE ---- ${DEBUG_MODE_CACHED_POSITIONS}`);
console.log('---------------');

class ServerNode { 
  constructor() {
    this._buses = {};
    this._busesIndex = {};
    this.readConfig();
    this._localCache = {};
  }

  readConfig() {
    this._busStops = JSON.parse(fs.readFileSync(process.env.BUS_STOP_CONFIG));
  }

  getBuses() {
    return this._buses;
  }

  getBus(hash) {
    return new Promise((resolve, reject) => {
      if (Object.keys(this._busesIndex).includes(hash)) {
        resolve(this._busesIndex[hash]);
      }
      reject(hash);
    });
  }

  // special method used for debuging / development 
  // to load historical position from the device and return old points as new ones ...
  // to enable fast track of development  -- doesn't need that device move itself in real ...
  // but use previous recorded information of movements ... 
  // 
  getBusLocationFromCache(bus) {
    return new Promise((resolve, reject) => {
      // check local cached information 
      var busData = this._localCache[bus.guid]; 
      if (!busData) {
        // first time load cache from konker api 
        konker.api.readData({guid: bus.guid, limit:1000})
          .then(data => {
            // set local buffer 
            this._localCache[bus.guid] = {buffer: data.filter(v => (v.payload.attr.type === 'FRI')), i:-1};
            // return just oldest position to the caller 
            resolve(this._localCache[bus.guid].buffer.slice(this._localCache[bus.guid].i));
          })
          .catch(ex => reject(ex));
      } else {
        // get the new point 
        this._localCache[bus.guid].i = this._localCache[bus.guid].i - 1;
        resolve(this._localCache[bus.guid].buffer.slice(this._localCache[bus.guid].i));
      }
    });

  }

  getBusLocation(bus) {
    if (DEBUG_MODE_CACHED_POSITIONS) 
      return this.getBusLocationFromCache(bus);
    return new Promise((resolve, reject) => {
      konker.api.readData({guid: bus.guid, limit:500})
        .then(data => {
          // filter events that are not: FRI          
          var data2 = data.filter(v => (v.payload.attr.type === 'FRI'));
          // var data2 = data; // all information
          resolve(data2);
        })
        .catch(ex => reject(ex));
    });
  }

  refreshBuses() {
    return new Promise((resolve, reject) => {
      konker.api.getAllDevices()
      .then(data => {
        data.forEach(bus => {
          bus.hash = md5(`${bus.guid} - ${bus.name}`);
          this._buses[bus.guid] = bus;
          this._busesIndex[bus.hash] = bus;        
        });
        resolve(this);
      })
      .catch(ex => {
        console.error(`ERROR on refreshing buses - HTTP ${ex.response.status} - ${ex.response.config.url}`);
        // console.debug(ex);
        reject(this);
      });
    });
  }

}

var server = new ServerNode();

server.refreshBuses().then(data => console.log('LOADED BUSES')).catch(ex => { console.error('PROBLEMS LOADING BUSES; CHECK APPLICATION AND API KEY INFORMATION'); process.exit(1); });

/* 
  SAMPLE USAGE OF API PROXY 
  ---------------------------
konker.api.getApplications().then(res => {
  konker.api.setApplication('globo');
  console.log('APPLICATIONS');
  console.log(res);
  konker.api.getAllDevices()
    .then(res => {
      console.log('GLOBO DEVICES ARE ');
      console.log(res);

      konker.api.readData({guid: res[0].guid, limit:1})
        .then(res => {
          console.log('DATA READ FROM DEVICE');
          console.log(res);
        })
        .catch(ex => {
          console.log('ERROR READING DATA');
          console.log(ex);
        });
    })
    .catch(ex => {
      console.log('DEVICES ERROR');
      console.log(ex);
    });
}).catch(ex => {
  console.log('ERROR');
  console.log(ex);
});
*/ 

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send('{"status":"ok"}');
});

app.get('/buses', (req, res) => {
  // get all data from the platform (devices registered for this application)
  // TODO: create a local cache to answer faster
  var data = server.getBuses();
  var returnValue = Object.keys(data).map(busId => {
    bus = data[busId];
    if (bus.active)
      return {
        hash: bus.hash,
        name: bus.name,
        line: bus.locationName,
        guid: bus.guid /* TODO: remove for production */

      };
    return undefined;
  });

  console.log(returnValue);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(returnValue);
  
});

app.get('/bus/:hash/position', (req, res) => {
  // return current position for a given bus .. 
  res.setHeader('Access-Control-Allow-Origin', '*');
  server.getBus(req.params.hash)
    .then(bus => {
      server.getBusLocation(bus)
        .then(data => {

          res.setHeader('Access-Control-Allow-Origin', '*');
          var payload = data.map(d => {d.payload.hash = req.params.hash; return d.payload;});
          // payload.hash = req.params.hash;
          res.status(200).send(payload);
        })
        .catch(ex => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.status(500).send(ex);
        });
    })
    .catch(ex => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(500).send(ex);
    });
});


app.get('/stops/:line?', (req, res) => {
  // return current position for a given bus .. 
  let line = req.params.line;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(server._busStops.filter(bs => line ? bs.LINHA === line : 1));
});

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});

module.exports = app;

