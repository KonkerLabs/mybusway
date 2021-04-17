/*jshint esversion:9 */
const express = require('express');
class myRouter extends express.Router {
  constructor(server, passport) {
    super();
    this.server = server;
    this.passport = passport;

    this.post('/local', (req, res, next) => {
      // #swagger.tags = ['auth']
      this.passport.authenticate('local', (err, user, info) => {
        console.log(`err=${err} user=${user} info=${info}`);
        console.log(info);
        if (err) return res.status(400).json({errors:err});
        if (!user) return res.status(400).json({errors:'no user'});
        req.logIn(user, (err) => {
          if (err) return res.status(400).json({errors:err});
          const body = { _id: user._id, name: user.name };
          const token = jwt.sign({ user: body }, 'TOP_SECRET');
          return res.status(200).json({succes:'logged in', user:user, token:token});      
        });
      })(req, res, next);
    });
    // Ruta para autenticarse con Twitter (enlace de login)
    this.get('/twitter', passport.authenticate('twitter'));
    // #swagger.tags = ['auth']
    // Ruta de callback, a la que redirigirá tras autenticarse con Twitter.
    // En caso de fallo redirige a otra vista '/login'
    this.get('/twitter/callback', this.passport.authenticate('twitter',
      { successRedirect: '/', failureRedirect: '/login' }, (err, user, info) => {
    // #swagger.tags = ['auth']

        console.log(this);
      }));
  
    // Ruta para autenticarse con Facebook (enlace de login)
    this.get('/facebook', this.passport.authenticate('facebook'));
    // Ruta de callback, a la que redirigirá tras autenticarse con Facebook.
    // En caso de fallo redirige a otra vista '/login'
    this.get('/facebook/callback', this.passport.authenticate('facebook',
      { successRedirect: '/jwt', failureRedirect: '/login' }
    ));
  
  }
}
module.exports = (server, passport) => { return new myRouter(server, passport); };
