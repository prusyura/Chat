var mongoose = require('mongoose');
mongoose.connect('mongodb://user:user11@ds035026.mlab.com:35026/chatusers');
console.log('mongoDB connected!!');
module.exports=mongoose;