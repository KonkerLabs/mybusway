/*jshint esversion:9 */
const express = require('express');
class myRouter extends express.Router {
  constructor(server, passport, swaggerUi) {
    super();
    this.server = server;
    this.passport = passport;
    this.swaggerUi = swaggerUi;

    this.get('/buses', (req, res) => {
      // get all data from the platform (devices registered for this application)
      // TODO: create a local cache to answer faster
      // #swagger.tags = ['v1']
    server.getBuses().then(data => {
        var returnValue = Object.keys(data).map(busId => {
          var bus = data[busId];
          if (bus.active) {
            var info = {
              hash: bus.hash,
              name: bus.name,
              line: bus.locationName
            };
            if (process.env.NODE_ENV !== 'production') info.guid = bus.guid; /* ONLY FOR DEVELOPMENT TO ENABLE DEBUG */
            return info;
          }
          return undefined;
        });
      
        console.log(returnValue);
      
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(returnValue);
      
      });  
    });

    this.get('/bus/:hash/position', (req, res) => {
      // #swagger.tags = ['v1']
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
          console.log('error2');
          console.log(ex);
          res.status(500).send(ex);
        });
    });

    this.get('/stops/:line?', (req, res) => {
      // #swagger.tags = ['v1']
      // #swagger.parameters['line?'] = {required:false}
      // return current position for a given bus .. 
      let line = req.params.line;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(server._busStops.filter(bs => line !== 'undefined' ? bs.LINHA === line : 1));
    });

    this.get('/lines', (req, res) => { 
      // #swagger.tags = ['v1']
      server.getLines().then(doc => res.json(doc));
    });

    this.post('/line', (req, res) => {
      // #swagger.tags = ['v1']
      server.addLine(req.body).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    this.put('/line/:name', (req, res) => {
      // #swagger.tags = ['v1']
      server.updateLine({name:req.params.name, ...req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    this.delete('/line/:name', (req, res) => {
      // #swagger.tags = ['v1']
      server.removeLine({name:req.params.name}).then(doc=> res.json(doc)).catch(err => res.status(400).json(err));
    });

    // stops

    this.get('/line/:name/stops', (req, res) => {
      // #swagger.tags = ['v1']
      server.getStops({line:req.params.name}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    this.post('/line/:name/stop', (req, res) => {
      // #swagger.tags = ['v1']
      server.addStop({line:req.params.name, ... req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    this.delete('/line/:line/stop/:stop', (req, res) => {
      // #swagger.tags = ['v1']
      server.removeStop({line:req.params.line, name: req.params.stop}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    this.put('/line/:line/stop/:stop', (req, res) => {
      // #swagger.tags = ['v1']
      server.updateStop({line:req.params.line, name: req.params.stop, ... req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    // driver allocation 

    this.post('/bus/:bus/inLine/:line', (req, res) => {
      // #swagger.tags = ['v1']
      server.useBus(req.params.line, req.params.bus, req.user).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
    });

    if (swaggerUi) {
      this.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

  }
}
module.exports = (server, passport, swaggerUi) => { return new myRouter(server, passport, swaggerUi); };
