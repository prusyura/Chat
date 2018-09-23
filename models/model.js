var mongoose = require('../mongoose');
var schemaUser = mongoose.Schema({
	username:{
		type:String,
		unique:true,
		required:true
	},
	password:{
		type:String,
		unique:false,
		required:true
	}
},{versionKey:false});
var user = mongoose.model("User",schemaUser);
module.exports = user;