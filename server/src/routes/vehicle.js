/*jshint esversion:6 */

// references 
// https://mongoosejs.com/docs/models.html
// https://garywoodfine.com/restful-web-api-node-js/
// https://dev.to/beznet/build-a-rest-api-with-node-express-mongodb-4ho4
// https://www.freecodecamp.org/news/how-to-build-blazing-fast-rest-apis-with-node-js-mongodb-fastify-and-swagger-114e062db0c9/


const express = require('express');
const router = express.Router();

const Vehicle = require('../models/vehicle.js');
const Log = require('../models/vehicleUse');
const User = require('../models/user');
const Line = require('../models/line');

// Get all 
router.get('/', async (req, res) => {
  try {
    console.log('get all vehicles');
    const vehicles = await Vehicle.find();
    res.json({vehicles:vehicles, count:vehicles.length});  
  } catch (err) {
    console.log(err);
    res.status(500).json({errors:err});
  }
});

// Get one 
router.get('/:id', async (req, res) => {
  try {
    console.log(`get one vehicle ${req.params.id}`);
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      res.json({vehicle:vehicle});
    } else {
      res.json({message:'not found'});
    }

  } catch (err) { 
    res.status(500).json({errors:err});
  } 
});

// Create one 
router.post('/', (req, res) => {
  try {

    const vehicle = new Vehicle(req.body);
    console.log(vehicle);
    vehicle.save((err) => {
      if (err) res.status(500).json({errors:err});
      res.json(vehicle);      
    });

  } catch(err) { 
    res.status(500).json({errors:err});
  }
});

router.get('/:id/use/:line/by/:driver/on/:dt', async (req, res) => {

  console.log('registering use');
  console.log(req.params);

  try {

    console.log(`set vehicle with information - driver ${req.params.driver} in line ${req.params.line} on date ${req.params.dt}`);

    const car = await Vehicle.findOne({name:req.params.id});

    console.log('vehicle =');
    console.log(car);
    if (car) {

      // update vehicle 

      console.log('setting line');

      var line = await Line.findOne({name:req.params.line});
      var driver = await User.findOne({name:req.params.driver});

      if (line) {
        console.log('LINE=');
        console.log(line);  
      } else {
        console.log('NO LINE');
      }
      if (driver) {
        console.log('DRIVER=');
        console.log(driver);

      } else { 
        console.log('NO DRIVER');
        // register a new driver ...
        var idx = Math.round((Math.random())*1000000,0);
        var newDriver = new User({name:req.params.driver, password:idx, provider_id:idx});
        await newDriver.save((err) => {
          if (err) {console.log(err);}
          driver = newDriver;
        });
      }

      car.line = req.params.line != '<>' ? req.params.line : null;
      car.driver = driver ? driver.id : null;

      car.save(async (err) => {
        if (err) {console.log(err); res.status(500).json({errors:err});}
        // register a new log entry for this usage 

        console.log('finding line and driver...');



        var log = new Log({driver_id:driver ? driver.id : null, vehicle_id: car ? car.id : null, line_id:line ? line.id : null, event_type: line ? 'ASSOCIATE' : 'DISSOCIATE'});

        console.log(log);

        log.save((err) => {
          if (err) console.log(`ERROR SAVING LOG INFORMATION`);

          res.json({data:log});

        });

      });


    } else {
      res.status(500).json({errors:`missing data for vehicle ${req.params.id}`});
    }
    

  } catch(err) {
    console.log(err);
    res.status(500).json({errors:err});
  }

});

// Update one 
router.patch('/:id', (req, res) => {
});

// Delete one 
router.delete('/:id', (req, res) => {
});

module.exports = router;