const { Double } = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LineSchema = new Schema({
  name: String,
  color: String,
  properties: Map,
  createdAt: {type: Date, default: Date.now},
  stops: Array
});


// Exportamos el modelo 'User' para usarlo en otras
// partes de la aplicación
var LineModel = mongoose.model('Line', LineSchema);

module.exports = LineModel;
