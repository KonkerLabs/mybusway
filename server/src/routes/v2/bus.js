/*jshint esversion:9 */
const express = require('express');
class myRouter extends express.Router {
  constructor(server, passport) {
    super();
    this.server = server;
    this.passport = passport;

  // driver allocation 

  this.post('/:hash/state/:state', (req, res) => { 
    // #swagger.tags = ['bus']
    // #swagger.parameters['state'] = {'description':'bus state - [green, yellow, pink, blue, express, dedicated, loading, maintenance, undefined]'}
    
    server.getBus(req.params.hash)
      .then(bus => {
        server.updateBusState(bus, req.params.state)
          .then(data => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(200).send(data);    
          })
          .catch(ex => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(500).send(ex);    
          });
      });
  });

  this.post('/:bus/inLine/:line', (req, res) => {
    // #swagger.tags = ['bus']

    server.useBus(req.params.line, req.params.bus, req.user).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });


  this.get('/:hash/position', (req, res) => {
    // #swagger.tags = ['bus']
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
            console.log('error1');
            console.log(ex);
            res.status(500).send(ex);
          });
      })
      .catch(ex => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('API-V2: error2');
        console.log(ex);
        res.status(500).send(ex);
      });
  });

  this.get('/', (req, res) => {
    // #swagger.tags = ['bus']
    // get all data from the platform (devices registered for this application)
    // TODO: create a local cache to answer faster
    server.getBuses().then(data => {
      var returnValue = Object.keys(data).map(busId => {
        var bus = data[busId];
        if (bus.active) {
          // console.log(bus);
          var info = {
            hash: bus.hash,
            name: bus.name,
            line: bus.locationName,
            state: bus.state
          };
          if (process.env.NODE_ENV !== 'production') info.guid = bus.guid; /* ONLY FOR DEVELOPMENT TO ENABLE DEBUG */
          return info;
        }
        return undefined;
      });
    
      // console.log(returnValue);
    
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(returnValue);
    
    });  
  });
}
};
module.exports = (server) => { return new myRouter(server); };

