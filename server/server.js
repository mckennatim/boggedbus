var fs =require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bus', function (error) {
    if (error) {console.log(error);}
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  //console.log(db)
});
var Schema = mongoose.Schema

var GeoSchema = new Schema({
    route: String,
    dir: Number,
    headsign: String,
    georecs: {}
}, { strict: false });
var geo_route = mongoose.model('geo_routes', GeoSchema);

var BusrSchema = new Schema({
    route: String,
    dir: Number,
    headsign: String,
    ord: Number,
    stop_name: String,
    lat: Number,
    lon: Number,
    stop_id: String,
    trip: String,
    shape: String
}, { strict: false });

// collection name busrs has to be plural
var busr = mongoose.model('bus_rows', BusrSchema);
var rts = [];
var featarr=[];

//busr.find({route:'39'}).limit(30).exec(function (err, rows) {
//busr.find().limit(1600).sort({route:1, dir:1, ord:1}).exec(function (err, rows) {
// busr.find().sort({route:1, dir:1}).exec(function (err, rows) {
busr.find().limit().sort({route:1, dir:1, ord:1}).exec(function (err, rows) {
	//parse(rows);
	parseTrips(rows);
	processTrips(rts,rows)
});

var idx=0;
var parse = function(rows){
	features = [];
	console.log(rows.length)
	while(idx < rows.length){
		var getNextLeg=function(i){
			var k=i;
			//var message ='';
			var stoprow =[];
			var props = {};
			var a=[];
			console.log(rows[k].stop_name)
			console.log(rows[k].route + ' -  '+rows[k].dir)
			if(rows[k].stop_name){
				stoprow = rows[k];
				props.route = stoprow.route;
				props.dir = stoprow.dir;
				props.headsign = stoprow.headsign;
				props.ord = stoprow.ord;
				props.stop_name = stoprow.stop_name;
				props.stop_id = stoprow.stop_id;
				props.time = 0;
				props.distance = 0;
				props.speed = 0;

				//message='STOP'
				//console.log(message);
				var co =[];
				co[0] = rows[k].lon;
				co[1] =rows[k].lat;	
				a.push(co)			
			}
			
			//console.log(!rows[k].stop_name)
			while (rows[k+1] && !rows[k+1].stop_name){
				k++;
				//console.log(k)
				var co =[];
				co[0] = rows[k].lon;
				co[1] =rows[k].lat;	
				a.push(co)	
			}
			var dist = cumDistance(a);
			props.distance = dist;
			//console.log(k)
			return {
				//message: message,
				nextIdx: k,
				//stoprow: stoprow,
				properties:props,
				coordinates:a
			}								
		}	
		var thisLeg = getNextLeg(idx);
		var nidx = thisLeg.nextIdx;
		idx = nidx+1;
		//console.log(idx)
		var afeature = {
			geometry: {
				type: "LineString",
				coordinates:[]
			},
			type: "Feature",
			properties:{}
		} 
		afeature.geometry.coordinates=thisLeg.coordinates;
		afeature.properties=thisLeg.properties;
		features.push(afeature)
		//return features
		//console.log(thisLeg)
	}
	return features
	console.log('exited while subrows')
	//console.log(features)
	// console.log(features[0].geometry.coordinates)
	// console.log(features[1].geometry.coordinates)
	// console.log(features[2].geometry.coordinates)
}


var parseTrips = function(rows){
	console.log(rows.length)
	var idy=0;
	console.log('hi')
	while(idy < rows.length){
		var res=getTrip(idy,rows)
		idy = res.lastIdx+1;
		rts.push(res);
	}
	console.log(rts)
}


var getTrip= function(i,rows){
	var rt = rows[i].route
	var di = rows[i].dir
	var sti = i;
	var eni=i;
	while(rows[eni+1] && (rows[eni+1].route == rt && rows[eni+1].dir == di)){
		eni++
	}
	var res = {};
	res.idx1=sti
	res.lastIdx=eni
	res.rt =rt;
	res.dir = di;
	return res
};
var featrec=[];
var testfeat ={};
var processTrips = function(rts,rows){
	for (var i=0; i< rts.length;i++){
		var subrows = rows.slice(rts[i].idx1,rts[i].lastIdx+1);
		var rtrec = {
			route:subrows[0].route,
			dir:subrows[0].dir,
			headsign:subrows[0].headsign,
			georecs:{
				type: "FeatureCollection",
				features: []
			}
		}
		idx=0
		var tripfea = parse(subrows);
		//console.log(tripfea)
		rtrec.georecs.features =tripfea;
		featrec.push(rtrec)
	}
	//console.log(featrec[0])
	//console.log(featrec[1])
	testfeat = featrec[2]
	//console.log(featrec)
	fs.writeFile('feattest.json',JSON.stringify(testfeat.georecs), function (err) {
	  if (err) return console.log(err);
	});	
	//console.log(testfeat)
	testarr = testfeat.georecs.features[0].geometry.coordinates;

	geo_route.collection.insert(featrec, onInsert);

	function onInsert(err, docs) {
	    if (err) {
	       console.log(err)
	    } else {
	        console.info('%d potatoes were successfully stored.', docs.length);
	    }
	}
	geo_route.find({route:'04', dir:1}).limit(1).exec(function (err, docs) {
		console.log(docs)
		var ageo = docs[0].georecs;
		fs.writeFile('ageo.json',JSON.stringify(ageo), function (err) {
		  if (err) return console.log(err);
		});			
	});	
	//console.log(cumDistance(testarr))

	//console.log(features)
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles 
//                      'meters'    added  by mckt                            :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: http://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2015            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlon1 = Math.PI * lon1/180
	var radlon2 = Math.PI * lon2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	if (unit=="meters") { dist = dist * 1609.344 }		
	return dist
}            

function cumDistance(arr){
	var legDist =0;
	for (var i=0; i<(arr.length-1); i++){
		var pt1 = arr[i];
		var pt2 =arr[i+1];
		aDist = distance(pt1[1], pt1[0], pt2[1], pt2[0], 'meters');
		legDist += aDist;  
	}
	return Math.round(legDist);
}   

