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

// MongoDB database connection
var urlx = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_SERVER}:${MONGO_PORT}/${MONGO_DATABASE}`;
console.log(urlx);
mongoose.connect(urlx, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, res) {
  if(err) throw err;
  console.log('Conectado con éxito a la BD');
});

const keycloak = require('./config/keycloak-config').initKeycloak();

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


app.use(keycloak.middleware());

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
var server = new ServerNode(konker, keycloak);

server.refreshBuses().then(data => console.log('LOADED BUSES')).catch(ex => { console.error('PROBLEMS LOADING BUSES; CHECK APPLICATION AND API KEY INFORMATION'); process.exit(1); });

var acl = require('acl');
const { triggerAsyncId } = require('async_hooks');
// Or Using the mongodb backend
var prefix = 'acl';
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, prefix));

// general operations 
// general overview of the system 
app.get('/', (req, res) => {
  // console.log(passport);
  res.json({status:true, user:req.user});
});

// login 
app.get('/login', (req, res) => {
  console.log('LOGIN FORM');
  res.json({username: '', password:''});
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('LOGIN2');
  res.json({'MSG':'OK', 'USER':req.user});
});

// logout 
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// credentials for app integration
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

// management operations 

app.get('/expireCache', (req, res) => {
  server.forceCacheExpire();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send({cache:'expired'});
});

app.get('/cacheInfo', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send({cache:'active', ts:server._cacheTS.format(), size:Object.keys(server._buses).length});
});

// api documentation 

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// application API V1 compatibility 

const v1api = require('./routes/v1/api')(server, passport);
app.use('/', v1api);
const v1users = require('./routes/v1/users')(server);
app.use('/users', v1users);
const v1vehicles = require('./routes/v1/vehicle')(server);
app.use('/vehicles', v1vehicles);

// application API V2 endpoints

const auth = require('./routes/v2/auth')(server, passport);
app.use('/v2/auth', auth);

const bus = require('./routes/v2/bus')(server);
app.use('/v2/buses', bus);

const lines = require('./routes/v2/lines')(server);
app.use('/v2/lines', lines);

const stops = require('./routes/v2/stops')(server);
app.use('/v2/stops', stops);

const users = require('./routes/v2/users')(server);
app.use('/v2/users', users);

const vehicles = require('./routes/v2/vehicle')(server);
app.use('/v2/vehicles', vehicles);

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});

module.exports = app;

