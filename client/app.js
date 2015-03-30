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
				console.log(geojson)
				//console.log(geojson.features[0].geometry.type)
				map.data.addGeoJson(geojson);
				map.data.setStyle(function(feature){
					//console.log(feature.getProperty('distance'))
					if(feature.getProperty('distance')<500){
						return mystyle;
					}else{
						return mystyle2;
					}
				});
				zoom(map);
			}

			var mystyle2 = {
					"color":"blue",
					"strokeColor": "blue",
					"stroke-width":"3",
					"fill-opacity":0.6     	
			}

			var mystyle = {
					"color":"red",
					"strokeColor": "red",
					"stroke-width":"3",
					"fill-opacity":0.6     	
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
				DataService.getGeo(route).then(function(data){
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
		setRoutes: function(r){
			routes = r;
		},
		getRoutes: function(){
			return routes;
		},
		getGeo:function(br){
			var route = br.route;
			var dir = br.dir
			var url=httpLoc + 'geo/'+route+'/'+dir;
			console.log(url)
			var deferred = $q.defer();
			$http.get(url).   
				success(function(data, status) {
				console.log(data[0].georecs);
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
			var purl ='http://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route='+route+'&format=json'
		}
	}
}])