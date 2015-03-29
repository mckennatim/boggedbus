var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/stuffDb', function (error) {
    if (error) {console.log(error);}
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  //console.log(db)
});
var Schema = mongoose.Schema
var UserSchema = new Schema({
    name: {type:String, index:{unique: true}},
    apikey: String,
    email: String
}, { strict: false });

var User = mongoose.model('users', UserSchema);

User.find().limit(3).exec( function (err, docs) {
    console.log(docs)
    console.log(err)
});