var express = require('express');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bus', function (error) {
	if (error) {console.log(error);}
});
var db = mongoose.connection;
var Schema = mongoose.Schema

var GeoSchema = new Schema({
	route: String,
	dir: Number,
	headsign: String,
	georecs: {}
}, { strict: false });
var geo_route = mongoose.model('geo_routes', GeoSchema);

var RouteSchema = new Schema({
	route: String,
	dir: Number,
	headsign: String,
}, { strict: false });
var route = mongoose.model('routes', RouteSchema);



	// geo_route.find({route:'04', dir:1}).limit(1).exec(function (err, docs) {
	// 	console.log(docs)
	// 	var ageo = docs[0].georecs;
	// 	fs.writeFile('ageo.json',JSON.stringify(ageo), function (err) {
	// 	  if (err) return console.log(err);
	// 	});			
	// });	

var app = express();

app.all('*', function(req,res,next){
    var htt= req.headers.origin;
    res.header("Access-Control-Allow-Origin", htt);
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-xsrf-token, Authorization");
    next();
});

app.get('/', function (req, res) {
	res.send("<a href='/users'>Nice try</a>");
});

app.get('/geo/:route/:dir', function (req, res) {
	if (req.params.route && req.params.dir) {
		geo_route.find({route:req.params.route, dir:req.params.dir}).limit(1).exec(function (err, docs) {
			res.json(docs);
		});
	}
});

app.get('/routes', function (req, res) {
	route.find({}, {route:1, dir: 1, headsign:1}).sort({route:1, dir:1}).exec(function (err, docs) {
		res.json(docs);
	});
});

app.listen(3009);
console.log('server running on 3009')