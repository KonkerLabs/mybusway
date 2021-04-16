/*jshint esversion: 9*/

var session = require('express-session');
var Keycloak = require('keycloak-connect');
const chalk = require('chalk');

let keycloak;

var keycloakConfig = {
  'realm': process.env.KC_REALM || 'MyBusway',
  'auth-server-url': process.env.KC_SERVER_URL || 'http://localhost:5400/auth/',
  'ssl-required': 'none',
  'resource': process.env.KC_RESOURCE || 'mybusway-microservice',
  'realmPublicKey': process.env.KC_REALM_PUBLIC_KEY,
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