/*jshint esversion:9 */

// references 
// https://mongoosejs.com/docs/models.html
// https://garywoodfine.com/restful-web-api-node-js/
// https://dev.to/beznet/build-a-rest-api-with-node-express-mongodb-4ho4
// https://www.freecodecamp.org/news/how-to-build-blazing-fast-rest-apis-with-node-js-mongodb-fastify-and-swagger-114e062db0c9/


const express = require('express');

const User = require('../../models/user');

class myRouter extends express.Router {
  constructor(server, passport) {
    super();
    this.server = server;
    this.passport = passport;

  // Get all 
  this.get('/', async (req, res) => {
    // #swagger.tags = ['user']
    try {
      console.log('get all users');
      const users = await User.find();
      res.json({data:users, count:users.length});  
    } catch (err) {
      res.status(500).json({errors:err});
    }
  });

  // Get one 
  this.get('/:id', async (req, res) => {
    // #swagger.tags = ['user']
    try {
      console.log(`get one user ${req.params.id}`);
      const user = await User.findById(req.params.id);
      if (user) {
        res.json({data:user});
      } else {
        res.json({message:'not found'});
      }

    } catch (err) { 
      res.status(500).json({errors:err});
    } 
  });

  // Create one 
  this.post('/', (req, res) => {
    // #swagger.tags = ['user']
    try {

      const user = new User(req.body);
      console.log(user);
      user.save((err) => {
        if (err) res.status(500).json({errors:err});
        res.json(user);      
      });

    } catch(err) { 
      res.status(500).json({errors:err});
    }
  });

  // Update one 
  this.patch('/:id', (req, res) => {
    // #swagger.tags = ['user']
  });

  // Delete one 
  this.delete('/:id', (req, res) => {
    // #swagger.tags = ['user']
  });

}
}
module.exports = (server) => { return new myRouter(server); };
