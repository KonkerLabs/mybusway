/*jshint esversion:9 */
const express = require('express');
class myRouter extends express.Router {
  constructor(server, passport) {
    super();
    this.server = server;
    this.passport = passport;

  this.get('/', (req, res) => { 
    // #swagger.tags = ['line']
    server.getLines().then(doc => res.json(doc));
  });

  this.post('/', (req, res) => {
    // #swagger.tags = ['line']
    server.addLine(req.body).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });

  this.put('/:name', (req, res) => {
    // #swagger.tags = ['line']
    server.updateLine({name:req.params.name, ...req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });

  this.delete('/:name', (req, res) => {
    // #swagger.tags = ['line']
    server.removeLine({name:req.params.name}).then(doc=> res.json(doc)).catch(err => res.status(400).json(err));
  });

  // stops

  this.get('/:name/stops', (req, res) => {
    // #swagger.tags = ['line']
    server.getStops({line:req.params.name}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });

  this.post('/:name/stop', (req, res) => {
    // #swagger.tags = ['line']
    server.addStop({line:req.params.name, ... req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });

  this.delete('/:line/stop/:stop', (req, res) => {
    // #swagger.tags = ['line']
    server.removeStop({line:req.params.line, name: req.params.stop}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });

  this.put('/:line/stop/:stop', (req, res) => {
    // #swagger.tags = ['line']
    server.updateStop({line:req.params.line, name: req.params.stop, ... req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
  });

}
}
module.exports = (server) => { return new myRouter(server); };
