var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var { ObjectId } = mongoose;

var VehicleSchema = new Schema({
  name: String,
  hash: String,
  device_guid: String,
  driver_id: ObjectId,
  createdAt: {type: Date, default: Date.now},
  line: String,
  line_id: ObjectId,
  state: { type: String, enum: ['green', 'yellow', 'pink', 'blue', 'express', 'dedicated', 'charging', 'maintenance', 'undefined'] },
  active: Boolean // flag if this car is active 
});


// Exportamos el modelo 'User' para usarlo en otras
// partes de la aplicación
var VehicleModel = mongoose.model('Vehicle', VehicleSchema);

module.exports = VehicleModel;