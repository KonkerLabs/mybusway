/*jshint esversion:6 */

// references 
// https://mongoosejs.com/docs/models.html
// https://garywoodfine.com/restful-web-api-node-js/
// https://dev.to/beznet/build-a-rest-api-with-node-express-mongodb-4ho4
// https://www.freecodecamp.org/news/how-to-build-blazing-fast-rest-apis-with-node-js-mongodb-fastify-and-swagger-114e062db0c9/


const express = require('express');
const router = express.Router();

const User = require('../models/user');

// Get all 
router.get('/', async (req, res) => {
  try {
    console.log('get all users');
    const users = await User.find();
    res.json({data:users, count:users.length});  
  } catch (err) {
    res.status(500).json({errors:err});
  }
});

// Get one 
router.get('/:id', async (req, res) => {
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
router.post('/', (req, res) => {
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
router.patch('/:id', (req, res) => {
});

// Delete one 
router.delete('/:id', (req, res) => {
});

module.exports = router;