var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = new Schema({
  name: String,
  value: Map,
  createdAt: {type: Date, default: Date.now},
  changedAt: {type: Date, default: Date.now}
});

var Config = mongoose.model('Config', ConfigSchema);
