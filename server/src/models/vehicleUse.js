var mongoose = require('mongoose');
var { ObjectId } = mongoose;
var Schema = mongoose.Schema;

var VehicleUseSchema = new Schema({
  driver_id: ObjectId,
  vehicle_id: ObjectId, 
  line_id: ObjectId,
  event_type: String,
  dt: {type: Date, default: Date.now}
});


var VehicleUse = mongoose.model('VehicleUse', VehicleUseSchema);

module.exports = VehicleUse;