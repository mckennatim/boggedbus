Bogged Down Buses
==========

A graphical analytic tool for finding how fast the buses ar moving over different sections of their route.
<img src="hubhacks_banner.jpg" width="300px">

### Usage

Select 
* goto <http://boggedbuses.sitebuilt.net>
* select bus route
* choose date
* select time slot
* then press MapIt

### Purpose
Mayor Walsh and his staff seem intersted in monitoring the state of the city. By knowing how well the buses are moving you get a better sense of how well the city is working. 

While the mayors office does not run the MBTA, having a smoothly running transit system is in the best interests of the city. If one can identify problems with bogged down buses in a particlular section of the city or during a particular time of the day, solutions could be devised to help people move about more efficiently. Solutions for trouble spots might include:
* dedicated bus lanes 
* traffic light timed to the bus location
* re-routing

### Datasets
This project uses the Hubhacks2 data provided by the MBTA and combines it with schedule and shape data and the google map API v3.0 .

###Technologies
GeoJSON, Postgresql, PostGis, NodeJS  Nginx , Javascript, AngularJS, MongoDB, mapsAP!3

Building the data model was donewith the Potgresql relational database acting on files published periodically by the MBTA in directory of csv files called MBTA_GTFS. Once the static transformations, queries and joins were accomplished, what was left was GeoJSON objects representing the the collection of segments between all stops and their properties (such as distance between stops). They were assembled into a  feature collection for each route, those route JSON objects were then stored in a MongoDb. 

The application is then driven by the timePointCrossing data. This collection of prior real-time data, gives us the time each bus on each route arrives and departs at 10 points along its route at every time of the day for the days in February and March that were included in the data. That dataset is queried  (Postgres) every time you press MapIt. Before the map is displayed the data on those ten stops per route is turned ito durations between stops that is averaged over all the buses running in a half hour window from the user selected time. The properties of the GeoJSON object for the route are then modified and then it is passed into the map along with styles that depend on the speed property of each stop to stop leg. The duration between stops is based on realtime data whenever it is available and scheduled data when it is not. (That's why those MBTA apps are sometimes not actually realtime)

### Bugs
Right now something is wrong with the speed feature display for the inbound routes. So they won't show up until it is taken care of.

### a GeoJSON API
You can make calls to the API that runs this app.

The most interesting call returns a geoJSON object that you can plug right into a map. A call like this:

   <http://sitebuilt.net:3009/geo/40/1>

where '40' is the bus route and '1' indicates 'inbound'  (0  indicates 'outbound').

It returns a JSON object. thatobject.georecs gives you the geoJSON that you can plug into the map. For google maps that just means

				map = new google.maps.Map(document.getElementById('map-container'), {
					center: new google.maps.LatLng(0, 0),
					zoom: 2
				});
				map.data.addGeoJson(thatobject.georecs);

and you get a route drawn on the map with a set of properties for the path between each stop of the route. Those properties include..

				"properties": {
					"speed": 0,
					"distance": 372,
					"time": 0,
					"stop_id": "1618",
					"stop_name": "84 Georgetown Pl",
					"ord": 10000,
					"headsign": "Forest Hills Station via West Boundary Rd.",
					"dir": 1,
					"route": "40"
				},

Having date and time data like we got from timePointCrossings.csv and that you can get from realtime.mbta.com/developer/api/v2/predictionsbyroute would populate the properties time in seconds and speed in mph. In any event you can style each section between stops using code like

				map.data.setStyle(function(feature){
					var speed =feature.getProperty('speed')
					if(speed>20){
						return spstyle.green;
					}else if(speed>16){
						return spstyle.blue;
					}else if(speed>12){ 
						....
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
					"color":"purple", ...

### Ways to extend this project
Besides being able to analyze prior days and times, it would be useful to feed in the realime stream from the MBTA. The JSON produced from url queries like <realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=39&format=json> is very similar to the hubhacks2 tmePointCrossing data; it has finer resolution with time data on every stop, not just 10 per route, but, it often comes up empty when queried on some routes. (That's another reason while those MBTA apps are sometimes not actually realtime)

### Installation

Requires Postgresql, NodeJs and MongoDb. 
Create a database named 'bus' on mongo and mbta on postgres with postgresql as user
unzip the 
   
    cd /data
    mongo> use bus
    tar xvf dup.tar.gz
    mongorestore dump

    createdb mbta
    psql  mbta < <fullpath>/timepointcro.sql

from boggedbus/server directory run
  
    npm install
    node app

access the app

     http://yoursite.com/yourdirectory/boggedbus/client/index.html   





