var app = angular.module("App", [
		'ui.bootstrap'
		]);

app.constant('cfg', {
	setup: function(){
		var port = 3009;
		var url = 'http://localhost:'+port+'/';
		var prefix = 'bus_';
		var toState = 'map'
		return {
			port: port,
			url: url,
			prefix: prefix,
			toState: toState
		}
	},
	afterReg: function(user){
		console.log(user + ' is registered w/token')
	}
})

app.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])

app.run(function($window, $rootScope){
	$rootScope.online=false;
	$rootScope.status=0;
})

app.directive('busMap',function(){
	return{
		restrict: 'E',
		scope: {}, //isolates scope
		templateUrl: "bus-map.html",
		link: function(scope, element, attrs){

		}
	}
})

app.directive('busInfo',function(DataService){
	return{
		restrict: 'E',
		scope: {}, //isolates scope
		templateUrl: "bus-info.html",
		link: function(scope, element, attrs){
			var map;
			// map = new google.maps.Map(document.getElementById('map-container'), {
			// 	center: new google.maps.LatLng(0, 0),
			// 	zoom: 2
			// });
			// zoom(map)
			function initMap(geojson) {
			  // set up the map
				map = new google.maps.Map(document.getElementById('map-container'), {
					center: new google.maps.LatLng(0, 0),
					zoom: 2
				});
				//console.log(geojson)
				//console.log(geojson.features[0].geometry.type)
				map.data.addGeoJson(geojson);
				map.data.setStyle(function(feature){
					//console.log(feature.getProperty('distance'))
					var speed =feature.getProperty('speed')
					console.log(speed)
					//console.log(feature.getProperty('time'))
					if(speed>20){
						return spstyle.green;
					}else if(speed>16){
						return spstyle.blue;
					}else if(speed>12){
						return spstyle.yellow;
					}else if(speed>8){
						return spstyle.purple;
					}else if(speed>0){
						return spstyle.red;
					}else{
						return spstyle.black
					}
				});
				zoom(map);
			}

			var spstyle = {
				red: {
					"color":"red",
					"strokeColor": "red",
					"stroke-width":"3",
					"fill-opacity":0.6 
				},
				purple: {
					"color":"purple",
					"strokeColor": "purple",
					"stroke-width":"3",
					"fill-opacity":0.6 
				},
				yellow: {
					"color":"yellow",
					"strokeColor": "yellow",
					"stroke-width":"3",
					"fill-opacity":0.6 
				},
				blue: {
					"color":"blue",
					"strokeColor": "blue",
					"stroke-width":"3",
					"fill-opacity":0.6 
				},
				green: {
					"color":"green",
					"strokeColor": "green",
					"stroke-width":"3",
					"fill-opacity":0.6 
				},
				black: {
					"color":"black",
					"strokeColor": "black",
					"stroke-width":"3",
					"fill-opacity":0.6 
				}
			}

			function zoom(map) {
				var bounds = new google.maps.LatLngBounds();
				map.data.forEach(function(feature) {
					processPoints(feature.getGeometry(), bounds.extend, bounds);
				});
				map.fitBounds(bounds);
			}

			function processPoints(geometry, callback, thisArg) {
			  if (geometry instanceof google.maps.LatLng) {
			    callback.call(thisArg, geometry);
			  } else if (geometry instanceof google.maps.Data.Point) {
			    callback.call(thisArg, geometry.get());
			  } else {
			    geometry.getArray().forEach(function(g) {
			      processPoints(g, callback, thisArg);
			    });
			  }
			}

			google.maps.event.addDomListener(window, 'load', function() {
				map = new google.maps.Map(document.getElementById('map-container'), {
					center: new google.maps.LatLng(42.3475091114,-71.0745640589),
					zoom: 12
				});
			});							
			DataService.remoteRoutes().then(function(data){
				scope.routes = data;
				//console.log(data)
			})
			scope.getMap= function(route){
				console.log(route)

				// DataService.predictionsByRoute(route).then(function(data){
				// 	console.log(data)
				// })				
			}
			scope.sdates =DataService.sdates;
			scope.sdate = scope.sdates[0];
			scope.times =DataService.times;
			scope.time = scope.times[0]
			scope.mapIt =function(){
				var params =scope.route;
				params.sdate =scope.sdate ;
				params.stime = scope.time;
				//console.log(params);
				DataService.getGeo(params).then(function(data){
					initMap(data[0].georecs);
				})				
			}
		}
	}
})

app.directive('busRoutes', function(DataService){
	return{
		restrict: 'E',
		scope: {}, //isolates scope
		templateUrl: "bus-routes.html",
		link: function(scope, element, attrs){
		}
	}
})

app.factory('DataService', ['$http', '$q',  'cfg',  function($http, $q, cfg) {
	console.log(cfg.setup().url)
	var httpLoc= cfg.setup().url;
	var routes;
	var sdates =  ['2015-02-23','2015-02-24','2015-02-25','2015-02-26','2015-02-27','2015-02-28','2015-03-01'];
	console.log(sdates[0])
	var makeTimeArr = function(){
		var arr =['05:30:00'];
		var sd =330; //05:30:00
		for (var i=1; i <37;i++){
			sd +=30;
			var hr = Math.floor(sd/60);
			var min =Math.floor(sd - hr*60)
			if(hr<10){hr="0"+hr}
			if(min<10){min="0"+min}
			arr[i] =hr+':'+min+':00'
		}
		return arr;
	}
	var times = makeTimeArr();
	return {
		remoteRoutes: function() {
			var url=httpLoc + 'routes/';
			var deferred = $q.defer();
			$http.get(url).   
				success(function(data, status) {
				//console.log(data);
				//console.log(status);
				routes = data;
				deferred.resolve(data);
			}).
				error(function(data, status){
					console.log(data || "Request failed");
					console.log(status);
					if (status==0){
						deferred.reject({message: 'server is down'})
					} else if(status==401){
						deferred.reject({message: 'Authorization failed, try re-entering apikey'})               
					} else if(status==404){
						deferred.reject({message: '404, try re-entering apikey'})
					}else{
						deferred.reject({message: 'no clue on what is wrong'})
					}
				});
			return deferred.promise;
		},
		routes: routes,
		sdates:sdates,
		times:times,
		setRoutes: function(r){
			routes = r;
		},
		getRoutes: function(){
			return routes;
		},
		getGeo:function(br){
			var route = br.route;
			var dir = br.dir;
			var sdate = br.sdate;
			var stime = br.stime;
			var url=httpLoc + 'geo/'+route+'/'+dir+'/'+sdate+'/'+stime;
			//console.log(url)
			var deferred = $q.defer();
			$http.get(url).   
			success(function(data, status) {
				//console.log(data[0].georecs);
				//console.log(status);
				routes = data;
				deferred.resolve(data);
			}).
			error(function(data, status){
				console.log(data || "Request failed");
				console.log(status);
				if (status==0){
					deferred.reject({message: 'server is down'})
				} else if(status==401){
					deferred.reject({message: 'Authorization failed, try re-entering apikey'})               
				} else if(status==404){
					deferred.reject({message: '404, try re-entering apikey'})
				}else{
					deferred.reject({message: 'no clue on what is wrong'})
				}
			});
			return deferred.promise;			
		},
		predictionsByRoute: function(br){
			var route = br.route;
			var dir = br.dir
			var deferred = $q.defer();
			var purl ='http://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route='+route+'&format=json'
			$http.get(purl).   
			success(function(data, status) {
				//console.log(data);
				//console.log(status);
				routes = data;
				deferred.resolve(data);
			}).
			error(function(data, status){
				console.log(data || "Request failed");
				console.log(status);
				if (status==0){
					deferred.reject({message: 'server is down'})
				} else if(status==401){
					deferred.reject({message: 'Authorization failed, try re-entering apikey'})               
				} else if(status==404){
					deferred.reject({message: '404, try re-entering apikey'})
				}else{
					deferred.reject({message: 'no clue on what is wrong'})
				}
			});
			return deferred.promise;
		}
	}
}])