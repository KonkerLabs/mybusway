var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
  name: String,
  vehicle: String,
  line: String,
  ts: {type: Date, default: Date.now}
});


// Exportamos el modelo 'User' para usarlo en otras
// partes de la aplicación
var Log = mongoose.model('Log', LogSchema);
