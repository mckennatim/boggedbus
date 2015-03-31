Bogged Down Buses
==========

A graphical analytic tool for finding how fast the buses ar moving over different sections of their route.

### Usage

Select 
* goto <http://boggedbuses.sitebuilt.net/boggedbus/client/index.html>
* select bus route
* choose date
* select time slot
then press MapIt

### Purpose
Mayor Walsh and his staff seem intersted in monitoring the state of the city. By knowing how well the buses are moving you get a better sense of how well the city is working. 

While the mayors office does not run the MBTA, having a smoothly running transit system is in the best interests of the city. If one can identify problems with bogged down buses in a particlular section of the city or during a particular time of the day, solutions could be devised to help people move about more efficiently. Solutions for trouble spots might include:
* dedicated bus lanes 
* traffic light timed to the bus location
* re-routing

### Datasets
This project uses the Hubhacks2 data provided by the MBTA .

###Technologies
GeoJSON, Postgresql, PostGis, NodeJS  Nginx , Javascript, AngularJS, MongoDB, mapsAP!3

Building the data model was donewith the Potgresql relational database. Once the static transformations, queries and joins were accomplished, what was left was GeoJSON objects representing the the collection of segments between all stops and their propertie (such as distance between stops). They were assembled into a  feature collection for each route, those route JSON objects were then stored in a MongoDb. 

The application is then driven by the timePointCrossing data. This collection of prior real-time data, gives us the time each bus on each route arrives and departs at 10 points along its route at every time of the day for the days in February and March that were included in the data. That dataset is queried  (Postgres) every time you press MapIt. Before the map is displayed the data on those ten stops per route is turned ito durations between stops that is averaged over all the buses running in a half hour window from the user selected time. The properties of the GeoJSON object for the route are then modified and then it is passed into the map along with styles that depend on the speed property of each stop to stop leg. 

### Bugs
Rigth now something is wrong with the speed feature display for the inbound routes. So they won't show up until it is taken care of.

### Ways to extend this project
Besides being able to analyze prior days and times, it would be useful to feed in the realime stream from the MBTA. The JSON produced from url queries like <realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=39&format=json> is very similar to the hubhacks2 tmePointCrossing data; it has finer resolution with time data on every stop, not just 10 per route, but, it often comes up empty when queried on some routes.

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





