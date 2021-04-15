/*jshint esversion:9 */
const express = require('express');
class myRouter extends express.Router {
  constructor(server, passport) {
    super();
    this.server = server;
    this.passport = passport;

  this.get('/:line?', (req, res) => {
    // #swagger.tags = ['bus']
    // #swagger.parameters['line?'] = {required:false}
    // return current position for a given bus .. 
    var line = req.params.line;
    var data = server._busStops.filter(bs => line !== 'undefined' ? bs.line === line : true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(data);
  });

}
}
module.exports = (server) => { return new myRouter(server); };
