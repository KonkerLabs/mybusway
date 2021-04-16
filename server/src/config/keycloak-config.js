/*jshint esversion: 9*/

var session = require('express-session');
var Keycloak = require('keycloak-connect');
const chalk = require('chalk');

let keycloak;

var keycloakConfig = {
  'realm': 'MyBusway',
  'auth-server-url': 'http://localhost:5400/auth/',
  'ssl-required': 'none',
  'resource': 'mybusway-microservice',
  'realmPublicKey': 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqm0Y/wQesVOcA0tAOETbVbuoOK3gTiZ7Nr9JS5PHJT8n7o93XHjXB8+ThsHmhKz/eoyp/9A4qPathRauzZI9vn/xHLnjHbtSH3abIRT4X3TuBJcZH+jOIVrH1f69MxdWoPW/sQrVad08DuNRhVon8gMW0p2ZoTV3xGgHCg2Efeux1e4ygatDGHvzWl6BaZeMx6dn/QACuDhys0O1QJGVJYKXSetifu8ocRpYDWUz0OPNiE6xWoilHJu+UhtlVldHVIIrBknyEVZmfQxxPBsz3OHLu1biv/WURDAtPWXYXrJ6XGDnie+2mDUPIXReWPqt2HQnhe246OW0HClAjim+MwIDAQAB',
  'bearer-only': true
};

const initKeycloak = () => {
  if (keycloak) {
    console.log('returning existing keycloak instance');
    return keycloak;
  } else { 
    console.log('initializing keycloak ...');
    var memoryStore = new session.MemoryStore();
    keycloak = new Keycloak({
      store: memoryStore,
      secret: 'any_key',
      resave: false,
      saveUninitialized: true
    }, keycloakConfig);
    return keycloak;
  }
};

module.exports =  {
  initKeycloak
}