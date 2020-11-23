const { Double } = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StopSchema = new Schema({
  name: String,
  lat: Number,
  long: Number,
  createdAt: {type: Date, default: Date.now},
  active: Boolean, // flag if this stop is active 
  autoCreated: Boolean // flag if it was auto-created 
});


// Exportamos el modelo 'User' para usarlo en otras
// partes de la aplicación
var Stop = mongoose.model('Stop', StopSchema);
