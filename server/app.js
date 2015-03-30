var express = require('express');
var mongoose = require('mongoose');
var http =require('http');
var pg = require('pg');

var conString = "postgres://postgres:jjjjjj@localhost/mbta";
var client = new pg.Client(conString);

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
});



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

var pbrSchema = new Schema({
	route_id: String,
	route_name: String,
	route_type: String,
	mode_name: String,	
	direction: [{
			direction_id: String,
			direction_name: String,
			trip: {},
		}]
}, { strict: false });
var pbr = mongoose.model('pbrs', pbrSchema);

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

var geoobj ={}
app.get('/geo/:route/:dir/:sdate/:stime', function (req, res) {
	if (req.params.route && req.params.dir && req.params.sdate && req.params.stime) {
		geo_route.find({route:req.params.route, dir:req.params.dir}).limit(1).exec(function (err, docs) {
			//console.log(docs)
			geoobj=docs[0].georecs.features;
			console.log(geoobj[0].properties)
			res.json(docs);
			//insertPbr(req.params.route);
			getTpc(req.params.route);
		});
	}
});

app.get('/routes', function (req, res) {
	route.find({}, {route:1, dir: 1, headsign:1}).sort({route:1, dir:1}).exec(function (err, docs) {
		res.json(docs);
	});
});

app.get('/dates', function (req, res) {
	route.find({}, {route:1, dir: 1, headsign:1}).sort({route:1, dir:1}).exec(function (err, docs) {
		res.json(docs);
	});
});

app.listen(3009);
console.log('server running on 3009')

var insertPbr = function(route){
	var options = {
		host: 'realtime.mbta.com',
		path: '/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route='+route+'&format=json'
	};
	http.get(options, function(res) {
		var body = '';
		console.log("Got response: " + res.statusCode);
		res.on("data", function(chunk) {
			body+=chunk
		});
		res.on('end', function() {
			var fbResponse = JSON.parse(body)
			var pbrdoc = new pbr(fbResponse);
			pbrdoc.save(function (err) {
				if (err) // ...
					console.log(err);
				});
			console.log(fbResponse);
		});		
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});	
}

var getTpc = function(route){
	var client = new pg.Client(conString);
	var body = [];
	client.connect();
	//var query = client.query("SELECT * FROM timepointcro LIMIT 10");
	var query = client.query("SELECT servicedate, tripid, route, direction, stop,  tpo, scheduled, arrival, departure FROM timepointcro WHERE route = '39' AND direction = 'Inbound' AND servicedate='2015-2-23' AND scheduled >= '1900-01-01 08:30:00.000' AND scheduled < '1900-01-01 09:00:00.000'  ORDER BY route, direction, tripid, tpo");
	query.on('row', function(row) {
		body.push(row)
	});
	query.on('end', function(){
		client.end.bind(client);
		extractTimes(body)
	});
}

var extractTimes= function(t){
	//console.log(t)
	console.log(t.length)
	var reca = [];
	var i =0
	while (i < t.length){
		var arec = {};
		var cur = t[i].tripid
		while (t[i] && t[i].tripid==cur){
			var tost, frst, dur;
			frst = t[i].stop;

			if (t[i+1] && (t[i+1].tripid==t[i+1].tripid)){
				var ob ={}
				tost = t[i+1].stop;
				var tot = new Date(t[i+1].scheduled);
				var frt =  new Date(t[i].scheduled)
				dur = (tot - frt)/1000
				ob.frstop=frst;
				ob.tostop=tost;
				ob.dur=dur
				//console.log(ob)
				reca.push(ob)
			}
			i++
		}
		if (t[i]){cur = t[i].tripid}
	}
	pgSave(reca);

}
 var pgSave = function(reca){
 	//console.log(reca)
 	console.log(reca.length)
 	var durs = [];
 	var client = new pg.Client(conString);
 	client.connect();
 	client.on('drain', client.end.bind(client));
	client.query("DROP TABLE reca", function(err, result){
		console.log(err)
	});
	client.query("CREATE  TABLE reca (frstop varchar(20), tostop varchar(20), dur integer)", function(err, result){
		console.log(err)
		console.log('created')
	});
	for (var i=0;i<reca.length; i++){
		client.query({text: "INSERT INTO reca (frstop, tostop, dur) values ( $1, $2, $3 ) ", values: [reca[i].frstop, reca[i].tostop, reca[i].dur]}, function(err, result){
		});

	}
	var sq =client.query("SELECT frstop,tostop, avg(dur)::integer FROM reca WHERE dur>0 GROUP BY frstop, tostop", function(err, result){
		console.log(err)
	});
	sq.on('row', function(row) {
		durs.push(row)
	});		
	sq.on('end', function(){
		console.log(durs)
		processGeo(durs);
	});	
 }

var processGeo = function(d){
	console.log(geoobj[0].properties)
}
