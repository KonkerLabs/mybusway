/*jshint esversion: 6 */

var moment = require('moment');
const { MongoClient } = require('mongodb');
var mongoose = require('mongoose');
var md5 = require('md5');
const { userInfo } = require('os');

var VehicleUse = mongoose.model('VehicleUse');
var Vehicle = mongoose.model('Vehicle');
var Line = mongoose.model('Line');
var Stop = mongoose.model('Stop');
var User = mongoose.model('User');
var conversion = require('./aux.js');

// require('./models/vehicle');

const DEBUG_MODE_CACHED_POSITIONS = conversion.parseBool(process.env.DEBUG_MODE_CACHED_POSITIONS);

const CACHE_EXPIRE_TIME = parseInt(process.env.CACHE_EXPIRE_TIME || '15');
const MONGO_SERVER = process.env.MONGO_SERVER || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongo';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopwd';
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'mybusway';

class ServerNode { 
  constructor(konker) {
    this._buses = {};
    this._busesIndex = {};
    this.readConfig();
    this._localCache = {};
    this._cacheTS = moment();
    this._flagReloadCache = false;
    this._konker = konker;
    this._lines = [];

    // initialize mongo driver 
    var uri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DATABASE}`;
    this._dbClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this._dbClient.connect().then(db => {
      console.log('connected to the database');
      console.log(uri);
      this._db = db.db(MONGO_DATABASE);
      // console.log(this._db);
    }).catch(err => {
      console.log('problems connecting to the database');
      console.log(err);
      console.log(uri);
    });
  }

  /** login and return a token to the user  */
  login(data) {
    
  }

  /** register a new user -- saving information like ID, PHONE and EMAIL */
  register(data) {

  }

  forceCacheExpire() {
    this._flagReloadCache = true;
  }

  cacheExpired() {
    return (moment.duration(this._cacheTS.diff(moment())).asMinutes() > CACHE_EXPIRE_TIME) || this._flagReloadCache;
  }

  readConfig() {
    var fs = require('fs');
    this._busStops = JSON.parse(fs.readFileSync(process.env.BUS_STOP_CONFIG));
  }

  // lines API

  getLines() {
    return new Promise((resolve, reject) => {

      Line.find((err, lines) => {
        this._lines = lines;
        return lines;
      })
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  }

  addLine(data) { 
    console.log(data);
    var line = new Line(data);
    return new Promise((resolve, reject) => {
      line.save((err, doc) => {
        if (err) reject(err);
        // this.refreshLines();
        resolve(doc);
      });
    });
  }

  removeLine(data) {
    return new Promise((resolve, reject) => {
      console.log(`remove line ${data.name}`);
      Line.findOneAndDelete({name:data.name}, (err, doc) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve({deleted:(doc != null), name: data.name, id:doc});
        }
      });
    });
  }

  updateLine(data) {
    return new Promise((resolve, reject) => {
      Line.findOneAndUpdate({name:data.name}, data, (err, doc) => {
        if (err) { console.log(err); reject(err); }
        resolve(doc);
      });
    });
  }

  // stops

  getAllStops() {
    return this.getLines().then(lines => {
      return lines.map(line => { return line.stops; });
    }).then(stops => {
      console.log(stops);
      return stops;
    });
  }

  getStops(data) {
    var line = data.line;
    return new Promise((resolve, reject) => {
      Line.findOne({name:line}, (err, doc) => {
        if (err) reject(err);
        if (!doc.stops) doc.stops = [];
        resolve(doc.stops);
      });
    });
  }

  addStop(data) { 

    var line = data.line ; 
    var stop = { name: data.name, lat: data.lat, long: data.long, createdAt: Date.now(), active: true, auto: data.auto };
    
    return new Promise((resolve, reject) => {
      console.log(`add stop ${data.name} to ${line}`);
      Line.findOne({name: line}, (err, doc) => {
        if (err) reject(err);

        if (!doc.stops) doc.stops = [];

        console.log('STOPS => ');
        console.log(doc.stops);
        
        var found = doc.stops.reduce((t,v,i) => (t || (v.name === stop.name)), false); 
        if (found) { 
          reject({message: `stop ${stop.name} already configurated for ${line}`}); 
        } else { 
          doc.stops.push(stop);
          Line.update({name:line}, doc, (err) => {if (err) reject(err); resolve(doc); });
        }
      });
    });    
  }

  removeStop(data) {
    
    var line = data.line ; 
    var stop = { name: data.name };

    return new Promise((resolve, reject) => {
      console.log(`remove stop ${data.name} from ${line}`);
      Line.findOne({name:line}, (err, doc) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          if (!doc.stops) doc.stops = [];

          var stops = doc.stops.filter((v) => (v.name != stop.name));
          doc.stops = stops;

          // update

          Line.updateOne({name:line}, doc, (err) => {if (err) reject(err); else resolve(doc);});
        }
      });
    });
  }

  updateStop(data) {
    var line = data.line ; 
    var stop = { name: data.name, lastUpdatedAt: Date.now() };
    Object.keys(data).forEach(k => {
      if (k != 'line') {
        stop[k] = data[k];
      }
    });

    console.log('UPDATE STOP=>');
    console.log(stop);

    return new Promise((resolve, reject) => {
      Line.findOne({name:line}, (err, doc) => {
        if (err) { console.log(err); reject(err); }
        
        if (!doc.stops) doc.stops = [];
        var stops = doc.stops.map((v) => {
          console.log(`${v.name} === ${stop.name} ??? ${v.name == stop.name}`);
          if (v.name == stop.name) {
            return {...v, ...stop};
          }
          return v;
        });
        console.log(stops);
        doc.stops = stops;
        Line.updateOne({name:line}, doc, (err) => {if (err) reject(err); resolve(doc);});
      });
    });
  }

  // vehicle use

  getBusesForLine(line, opts) {
    
  }

  useBus(lineName, busName, driver) {
    return new Promise((resolve, reject) => {
      if (!driver || !driver._id) reject({error:'missing driver information'});
      Line.findOne({name:lineName}).then(line => {
        Vehicle.findOne({name:busName}).then(bus => {
          var use = new VehicleUse({
            vehicle_id: bus._id,
            line_id: line._id,
            driver_id: driver._id,
            dt: Date.now()
          });

          use.save((err, doc) => {
            if (err) reject(err);
            resolve(doc);
          });
          
        });
        resolve();

      });
      resolve();
    });
    
  }

  // buses
   

  getBuses() {
    if (this.cacheExpired()) 
      return this.refreshBuses();
    return new Promise((resolve, reject) => resolve(this._buses));
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
        this._konker.api.readData({guid: bus.guid, limit:1000})
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
      this._konker.api.readData({guid: bus.guid, limit:500})
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
      this._konker.api.getAllDevices()
      .then(data => {
        data.forEach(bus => {
          bus.hash = md5(`${bus.guid} - ${bus.name}`);
          this._buses[bus.guid] = bus;
          this._busesIndex[bus.hash] = bus;        
          // update database for current buses 


          // check if bus is already registered 

          Vehicle.findOne({device_guid: bus.guid}, (err, obj) => {
            if (err) throw err;
            if (obj) console.log(`bus ${obj.device_guid} already exists - ${bus.hash} x ${bus.name}`);
            else {
              var vehicle = new Vehicle({
                name: bus.name,
                device_guid: bus.guid,
                hash: bus.hash,
                active: true
              });
    
              vehicle.save((err, obj) => {
                if (err) throw err;
                console.log('saved new Vehicle');
              });    
            }
          });
          
        });
        this._cacheTS = moment();
        this._flagReloadCache = false;
        resolve(this._buses);
      })
      .catch(ex => {
        console.error(`ERROR on refreshing buses - HTTP ${ex.response.status} - ${ex.response.config.url}`);
        // console.debug(ex);
        reject(this);
      });
    });
  }

}

// var server = new ServerNode();

module.exports = { ServerNode };