/*jshint esversion: 8 */
// Modelo Usuario para la base de datos

// Mongoose es una libreria de Node que nos permite
// conectarnos a una base de datos MongoDB y modelar un esquema
// para ella.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

// Campos que vamos a guardar en la base de datos
var UserSchema = new Schema({
  name				: {type: String, required: true, unique: true}, // Nombre del usuario
  password    : {type: String, required: true}, // password 
	provider_id : {type: String, unique: true}, // ID que proporciona Twitter o Facebook
	photo			 : String, // Avatar o foto del usuario
	createdAt	 : {type: Date, default: Date.now}, // Fecha de creación
	roles      : {type: Array, required: false} // roles associated with this user 
});

UserSchema.pre('save', async function(next) { 
	const user = this;
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;
	next();
});

UserSchema.methods.isValidPassword = function(password) {
	return bcrypt.compare(password, this.password); 
};


// Exportamos el modelo 'User' para usarlo en otras
// partes de la aplicación
var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
