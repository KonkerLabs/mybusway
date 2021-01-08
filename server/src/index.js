/*jshint esversion: 6 */

var fs = require('fs');
var express = require('express');
var dotenv = require('dotenv');
var conversion = require('./aux.js');

var konker = require('./api/konker.js');
var mongoose = require('mongoose'); 
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');

require('./models/index');
require('./passport')(passport);
const jwt = require('jsonwebtoken');

// swagger API 
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const MONGO_SERVER = process.env.MONGO_SERVER || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongo';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopwd';
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'mybusway';

// Conexión a la base de datos de MongoDB que tenemos en local
var urlx = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DATABASE}`;
console.log(urlx);
mongoose.connect(urlx, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, res) {
  if(err) throw err;
  console.log('Conectado con éxito a la BD');
});

var app = express();

// Middlewares de Express que nos permiten enrutar y poder
// realizar peticiones HTTP (GET, POST, PUT, DELETE)
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const errorHandler = require('errorhandler');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(express.urlencoded({extended: true}));
//app.use(express.json());
app.use(methodOverride());

// configure express 
app.use(cors());

// Indicamos que use sesiones, para almacenar el objeto usuario
// y que lo recuerde aunque abandonemos la página
app.use(session({ secret: 'lollllo' }));

// Configuración de Passport. Lo inicializamos
// y le indicamos que Passport maneje la Sesión
app.use(passport.initialize());
app.use(passport.session());


// Si estoy en local, le indicamos que maneje los errores
// y nos muestre un log más detallado
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// load configuration environment from dotenv
dotenv.config();

konker.api.login(process.env.KONKER_API_TOKEN);
konker.api.setApplication(process.env.KONKER_APPLICATION);

const DEBUG_MODE_CACHED_POSITIONS = conversion.parseBool(process.env.DEBUG_MODE_CACHED_POSITIONS);

console.log('---------------');
console.log('ENVIRONMENT VARIABLES ...');
console.log(process.env);
console.log('---------------');

console.log(`Registering server with application KONKER_APPLICATION="${process.env.KONKER_APPLICATION}"`);
console.log(`using API TOKEN ... KONKER_API_TOKEN= ${process.env.KONKER_API_TOKEN}`);
console.log(`using ${DEBUG_MODE_CACHED_POSITIONS ? 'DEBUG' : 'PRODUCTION'} MODE ---- ${DEBUG_MODE_CACHED_POSITIONS}`);
console.log('---------------');

const { ServerNode } = require('./server');
var server = new ServerNode(konker);

server.refreshBuses().then(data => console.log('LOADED BUSES')).catch(ex => { console.error('PROBLEMS LOADING BUSES; CHECK APPLICATION AND API KEY INFORMATION'); process.exit(1); });

var acl = require('acl');
const { triggerAsyncId } = require('async_hooks');
// Or Using the mongodb backend
var prefix = 'acl';
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, prefix));

/* 
  SAMPLE USAGE OF API PROXY 
  ---------------------------
konker.api.getApplications().then(res => {
  konker.api.setApplication('globo');
  console.log('APPLICATIONS');
  console.log(res);
  konker.api.getAllDevices()
    .then(res => {
      console.log('GLOBO DEVICES ARE ');
      console.log(res);

      konker.api.readData({guid: res[0].guid, limit:1})
        .then(res => {
          console.log('DATA READ FROM DEVICE');
          console.log(res);
        })
        .catch(ex => {
          console.log('ERROR READING DATA');
          console.log(ex);
        });
    })
    .catch(ex => {
      console.log('DEVICES ERROR');
      console.log(ex);
    });
}).catch(ex => {
  console.log('ERROR');
  console.log(ex);
});
*/ 

// general operations 

app.get('/login', (req, res) => {
  console.log('LOGIN FORM');
  res.json({username: '', password:''});
});
/* Rutas de Passport */
// Ruta para desloguearse
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// authentication 

app.post('/auth/local', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
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
app.get('/auth/twitter', passport.authenticate('twitter'));
// Ruta de callback, a la que redirigirá tras autenticarse con Twitter.
// En caso de fallo redirige a otra vista '/login'
app.get('/auth/twitter/callback', passport.authenticate('twitter',
  { successRedirect: '/', failureRedirect: '/login' }, (err, user, info) => {
    console.log(this);
  }));

// Ruta para autenticarse con Facebook (enlace de login)
app.get('/auth/facebook', passport.authenticate('facebook'));
// Ruta de callback, a la que redirigirá tras autenticarse con Facebook.
// En caso de fallo redirige a otra vista '/login'
app.get('/auth/facebook/callback', passport.authenticate('facebook',
  { successRedirect: '/jwt', failureRedirect: '/login' }
));

// general operations 
app.get('/jwt', async(req, res, next) => {
  console.log('JWT');
  passport.authenticate(['local', 'facebook', 'twitter'], 
    async (err, user, info) => {

      console.log('PASSPORT JWT');

      req.login(user, {session:false}, async(error) => {
        if (error) return next(error);
        const body = { _id: user._id, name: user.name };
        const token = jwt.sign({ user: body }, 'TOP_SECRET');
        return res.json({ token });
      });

    })(req,res,next);
});


// general operations 
app.get('/', (req, res) => {
  // console.log(passport);
  res.json({status:true, user:req.user});
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('LOGIN2');
  res.json({'MSG':'OK', 'USER':req.user});
});

app.get('/expireCache', (req, res) => {
  server.forceCacheExpire();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send({cache:'expired'});
});

app.get('/cacheInfo', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send({cache:'active', ts:server._cacheTS.format(), size:Object.keys(server._buses).length});
});

app.get('/buses', (req, res) => {
  // get all data from the platform (devices registered for this application)
  // TODO: create a local cache to answer faster
  server.getBuses().then(data => {
    var returnValue = Object.keys(data).map(busId => {
      bus = data[busId];
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

app.get('/bus/:hash/position', (req, res) => {
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

app.get('/stops/:line?', (req, res) => {
  // return current position for a given bus .. 
  let line = req.params.line;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(server._busStops.filter(bs => line ? bs.LINHA === line : 1));
});

app.get('/lines', (req, res) => { 
  server.getLines().then(doc => res.json(doc));
});

app.post('/line', (req, res) => {
  server.addLine(req.body).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

app.put('/line/:name', (req, res) => {
  server.updateLine({name:req.params.name, ...req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

app.delete('/line/:name', (req, res) => {
  server.removeLine({name:req.params.name}).then(doc=> res.json(doc)).catch(err => res.status(400).json(err));
});

// stops

app.get('/line/:name/stops', (req, res) => {
  server.getStops({line:req.params.name}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

app.post('/line/:name/stop', (req, res) => {
  server.addStop({line:req.params.name, ... req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

app.delete('/line/:line/stop/:stop', (req, res) => {
  server.removeStop({line:req.params.line, name: req.params.stop}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

app.put('/line/:line/stop/:stop', (req, res) => {
  server.updateStop({line:req.params.line, name: req.params.stop, ... req.body}).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

// driver allocation 

app.post('/bus/:bus/inLine/:line', (req, res) => {
  server.useBus(req.params.line, req.params.bus, req.user).then(doc => res.json(doc)).catch(err => res.status(400).json(err));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const users = require('./routes/users');
app.use('/users', users);

const vehicles = require('./routes/vehicle');
app.use('/vehicles', vehicles);

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});

module.exports = app;

