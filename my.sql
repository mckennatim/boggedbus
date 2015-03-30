
--big1

SELECT 
  trips.shape_id, 
  shapes.shape_id, 
  routes.route_id, 
  trips.route_id, 
  stop_times.stop_id, 
  stops.stop_id, 
  trips.trip_id, 
  stop_times.trip_id
FROM 
  public.shapes, 
  public.routes, 
  public.locations, 
  public.trips, 
  public.timepoint, 
  public.stops, 
  public.stop_times
WHERE 
  shapes.shape_id = trips.shape_id AND
  trips.route_id = routes.route_id AND
  trips.trip_id = stop_times.trip_id AND
  stop_times.stop_id = stops.stop_id AND
  routes.route_id = '39' AND 
  trips.trip_id = '25836995';

SELECT 
  stop_sequence, stop_name, stop_lat, stop_lon, MIN(dist) 
FROM 
  public.shapes39stops
GROUP BY
  stop_name, stop_sequence, stop_lat, stop_lon 
ORDER BY
  stop_sequence;

SELECT 
  stops.stop_code, 
  stops.stop_name, 
  stops.stop_lat, 
  stops.stop_lon, 
  stops.location_type, 
  stops.stop_integer_id, 
  shapes.shape_id, 
  trips.trip_id, 
  stop_times.stop_id, 
  shapes.shape_pt_lat, 
  shapes.shape_pt_lon, 
  shapes.shape_pt_sequence, 
  stop_times.stop_sequence
FROM 
  public.stops, 
  public.trips, 
  public.shapes, 
  public.stop_times
WHERE 
  trips.trip_id = stop_times.trip_id AND
  shapes.shape_id = trips.shape_id AND
  stop_times.stop_id = stops.stop_id AND
  shapes.shape_id = '390036' AND 
  trips.trip_id = '25836990'
ORDER BY
  shapes.shape_pt_sequence ASC, 
  stop_times.stop_sequence ASC;

SELECT 
  a.shape_pt_lat,a.shape_pt_lon, b.stop_lat, b.stop_lon, a.shape_pt_sequence, b.stop_sequence, b.stop_name, b.stop_id, b.location_type
FROM 
  public.shapes39 a
LEFT JOIN  
    public.stops39 b
  ON 
    ST_DWithin(a.geog, b.geom, 100);

SELECT 
  a.shape_pt_lat,a.shape_pt_lon, b.stop_lat, b.stop_lon, a.shape_pt_sequence, b.stop_sequence, b.stop_name, b.stop_id, b.location_type, ST_Distance(a.geog, b.geom)as dist
FROM 
  public.shapes39 a
LEFT JOIN  
    public.stops39 b
  ON 
    ST_DWithin(a.geog, b.geom, 100);

SELECT 
  stops.stop_desc, 
  stops.stop_name, 
  stops.stop_code, 
  timepoint.vehicle, 
  timepoint.tripid, 
  timepoint.direction, 
  timepoint.stop, 
  timepoint.timepointorder
FROM 
  public.timepoint, 
  public.stops
WHERE 
  timepoint.stop = stops.stop_id AND
  timepoint.route = '39'
ORDER BY
  timepoint.route ASC, 
  timepoint.tripid ASC, 
  timepoint.timepointorder ASC;





ALTER TABLE timepoint ALTER COLUMN timepointorder TYPE integer USING (timepointorder::integer);

ALTER TABLE timepoint RENAME COLUMN timepointorder to tpo;


ALTER TABLE timepointcro ADD COLUMN tpo smallint;

UPDATE timepointcro SET tpo = (COALESCE(timepointorder, '99' )::integer);
SELECT  COALESCE(timepointorder, '99' ) FROM timepointcro ;
 
ALTER TABLE timepoint DROP COLUMN tpo;



SELECT 
  timepoint.timepointorder, 
  timepoint.tpo, 
  timepoint.route
FROM 
  public.timepoint;

  select current_timestamp - date '1900-01-01 00:00:00.000'

 copy timepointcro from  'c:/wamp/www/hackathon/hubhacks2/TimePointCrossing..csv' DELIMITER AS ',' CSV HEADER;

 CREATE TABLE public.timepointcro
(
  crossingid character varying(250) NOT NULL DEFAULT ''::character varying,
  servicedate date,
  district character varying(250) ,
  run character varying(250) ,
  block character varying(250) ,
  vehicle character varying(250) ,
  tripid character varying(250) ,
  route character varying(250) ,
  direction character varying(250) ,
  variation character varying(250) ,
  stop character varying(250) ,
  timepointorder smallint,
  scheduled character varying(250) ,
  arrival character varying(250) ,
  departure character varying(250) ,
  pointtype character varying(250) ,
  CONSTRAINT timepointcro_pkey PRIMARY KEY (crossingid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.timepointcro
  OWNER TO postgres;

-- Index: public.routetrippoint

-- DROP INDEX public.routetrippoint;

CREATE INDEX routetrippoint
  ON public.timepointcro
  USING btree
  (route COLLATE pg_catalog."default", tripid COLLATE pg_catalog."default", timepointorder);

SELECT 
  * 
FROM 
  public.timepointcro
WHERE 
  timepointcro.route = '39'
ORDER BY
  timepointcro.tripid ASC, 
  timepointcro.timepointorder ASC;

SELECT timepointorder, 
CASE timepointorder
	WHEN 'NULL' THEN  99 
	ELSE  timepointorder::integer
END 
FROM 
public.timepointcro
WHERE 
timepointcro.route = '39'
ORDER BY
timepointcro.tripid ASC, 
timepointcro.timepointorder ASC;

UPDATE timepointcro SET tpo = CASE timepointorder
	WHEN 'NULL' THEN  99 
	ELSE  timepointorder::integer
END ;

SELECT  
  timepointcro.route,
  timepointcro.servicedate, 
  timepointcro.tripid,
  stops.stop_code, 
  timepointcro.tpo,
  timepointcro.pointtype,
  timepointcro.direction,  
  stops.stop_name, 
  timepointcro.arrival 
FROM 
  public.timepointcro, 
  public.stops
WHERE 
  timepointcro.route = '39'AND
  timepointcro.stop = stops.stop_id 
ORDER BY
  timepointcro.tripid ASC, 
  timepointcro.tpo ASC;

SELECT 
   stop_lat, stop_lon ,stop_id, stop_name,MIN(dist)
FROM 
  public.shapes39stops
WHERE
 length(stop_name) >0  
GROUP BY stop_name, stop_lat, stop_lon ,stop_id;

SELECT 
   stop_lat, stop_lon ,stop_id, stop_name,MIN(dist)
FROM 
  public.shapes39stops
WHERE
 length(stop_name) >0  
GROUP BY stop_name, stop_lat, stop_lon ,stop_id;

SELECT 
   stop_lat, stop_lon ,stop_id, stop_sequence_integer, stop_name,MIN(dist)
INTO group39    
FROM 
  public.shapes39stops
WHERE
 length(stop_name) >0  
GROUP BY stop_name, stop_sequence_integer, stop_lat, stop_lon ,stop_id;

--doesn't catch first and last stops
SELECT 
  * 
FROM 
  public.group39, 
  public.shapes39stops
WHERE 
  group39.min = shapes39stops.dist; AND
  shape_pt_sequence - floor(shape_pt_sequence/10)*10 = 1;

  SELECT 
  route_id, direction_id, trip_headsign, COUNT(trip_headsign  ) as cnt
FROM 
  public.trips
WHERE service_id LIKE '%Weekday%'  
GROUP BY route_id, direction_id, trip_headsign
ORDER BY route_id, direction_id,cnt DESC;


--GET shapes for each route    


SELECT a.max, b.cnt, a.route_id, b.route_id, a.direction_id, b.trip_headsign
FROM 
tripmax as a
LEFT JOIN tripcnt as b
ON a.max=b.cnt AND a.route_id= b.route_id AND a.direction_id= b.direction_id
ORDER BY a.route_id, b.direction_id;

SELECT DISTINCT ON (trip_headsign)
  route_id, direction_id, trip_headsign, trip_id, shape_id
INTO trip1  
FROM 
  public.trips
ORDER BY trip_headsign;  

SELECT trip2.route_id, trip2.direction_id, trip2.trip_headsign, trip1.trip_id, trip1.shape_id
FROM 
trip2,
trip1
WHERE trip2.trip_headsign = trip1.trip_headsign;

SELECT trip2.route_id, trip2.direction_id, trip2.trip_headsign, trips1.trip_id
INTO tripid
FROM 
trip2,
trips1
WHERE trip2.trip_headsign = trips1.trip_headsign;

drop table tripid;
---********
SELECT trip2.route_id, trip2.direction_id, trip2.trip_headsign, trip1.trip_id, trip1.shape_id
INTO tripid
FROM 
trip2,
trip1
WHERE trip2.trip_headsign = trip1.trip_headsign;
 
 ---CREATES bus_routes
SELECT 
  tripid.route_id, 
  tripid.direction_id, 
  tripid.trip_headsign, 
  tripid.trip_id, 
  tripid.shape_id  
FROM 
  public.tripid, 
  public.routes
WHERE 
  tripid.route_id = routes.route_id AND
  routes.route_type = 3;

SELECT 
  tripid.route_id, 
  tripid.direction_id, 
  tripid.trip_headsign, 
  tripid.trip_id, 
  tripid.shape_id
INTO bus_routes  
FROM 
  public.tripid, 
  public.routes
WHERE 
  tripid.route_id = routes.route_id AND
  routes.route_type = 3;

  SELECT 
  shapes.shape_id, 
  shapes.shape_pt_lat, 
  shapes.shape_pt_lon, 
  shapes.shape_pt_sequence, 
  shapes.geog
FROM 
  public.shapes
ORDER BY 
  shape_id, shape_pt_sequence;

--CREATES bus_stops USING bus_routes
 SELECT 
  bus_routes.route_id, 
  bus_routes.direction_id, 
  stop_times.stop_sequence,
  bus_routes.trip_headsign,
  stops.stop_id,  
  stops.stop_name, 
  stops.stop_lat, 
  stops.stop_lon, 
  stops.geom 
FROM 
  public.stops, 
  public.stop_times, 
  public.bus_routes
WHERE 
  stops.stop_id = stop_times.stop_id AND
  stop_times.trip_id = bus_routes.trip_id AND
  bus_routes.route_id = '39'
ORDER BY route_id, direction_id, stop_sequence;

--bus_shapes
SELECT 
  bus_routes.route_id, 
  bus_routes.direction_id, 
  bus_routes.trip_headsign,
  bus_routes.shape_id,
  shapes.shape_pt_sequence, 
  shapes.shape_pt_lon, 
  shapes.shape_pt_lat, 
  shapes.geog, 
  bus_routes.trip_id 
FROM 
  public.bus_routes, 
  public.shapes
WHERE 
  bus_routes.shape_id = shapes.shape_id
ORDER BY
  bus_routes.route_id ASC, 
  bus_routes.direction_id ASC, 
  shapes.shape_pt_sequence ASC;

SELECT 
  bus_shapes.route_id as route, 
  bus_shapes.direction_id as dir, 
  bus_shapes.trip_headsign as headsign, 
  bus_shapes.shape_pt_sequence as ord,
  NULL as stop_name,
  bus_shapes.shape_pt_lat as lat,  
  bus_shapes.shape_pt_lon as lon,
  bus_shapes.geog as geo, 
  NULL as stop_id,
  bus_shapes.trip_id, 
  bus_shapes.shape_id
FROM 
  public.bus_shapes;

SELECT 
  bus_stops.route_id as route, 
  bus_stops.direction_id as dir, 
  bus_stops.trip_headsign as headsign,
  bus_stops.stop_sequence*10000 as ord,  
  bus_stops.stop_name as stop_name,   
  bus_stops.stop_lat as lat, 
  bus_stops.stop_lon as lon, 
  bus_stops.geom as geo,
  bus_stops.stop_id as stop_id,   
  NULL as trip,
  NULL as shape
FROM 
  public.bus_stops;

SELECT 
  bus_stops.route_id as route, 
  bus_stops.direction_id as dir, 
  bus_stops.trip_headsign as headsign,
  bus_stops.stop_sequence*10000 as ord,  
  bus_stops.stop_name as stop_name,   
  bus_stops.stop_lat as lat, 
  bus_stops.stop_lon as lon, 
  bus_stops.geom as geo,
  bus_stops.stop_id as stop_id,   
  NULL as trip,
  NULL as shape
FROM 
  public.bus_stops
 UNION 
SELECT 
  bus_shapes.route_id as route, 
  bus_shapes.direction_id as dir, 
  bus_shapes.trip_headsign as headsign, 
  bus_shapes.shape_pt_sequence as ord,
  NULL as stop_name,
  bus_shapes.shape_pt_lat as lat,  
  bus_shapes.shape_pt_lon as lon,
  bus_shapes.geog as geo, 
  NULL as stop_id,
  bus_shapes.trip_id, 
  bus_shapes.shape_id
FROM 
  public.bus_shapes;

  SELECT * INTO bus from(
SELECT 
  bus_stops.route_id as route, 
  bus_stops.direction_id as dir, 
  bus_stops.trip_headsign as headsign,
  bus_stops.stop_sequence*10000 as ord,  
  bus_stops.stop_name as stop_name,   
  bus_stops.stop_lat as lat, 
  bus_stops.stop_lon as lon, 
  bus_stops.geom as geo,
  bus_stops.stop_id as stop_id,   
  NULL as trip,
  NULL as shape
FROM 
  public.bus_stops
 UNION 
SELECT 
  bus_shapes.route_id as route, 
  bus_shapes.direction_id as dir, 
  bus_shapes.trip_headsign as headsign, 
  bus_shapes.shape_pt_sequence as ord,
  NULL as stop_name,
  bus_shapes.shape_pt_lat as lat,  
  bus_shapes.shape_pt_lon as lon,
  bus_shapes.geog as geo, 
  NULL as stop_id,
  bus_shapes.trip_id, 
  bus_shapes.shape_id
FROM 
  public.bus_shapes) as boo;

  mbta=# select row_to_json(bus) from bus \g |cat >> bus.json


  SELECT 
  timepointcro.servicedate, 
  timepointcro.tripid, 
  timepointcro.route, 
  timepointcro.direction, 
  timepointcro.stop,  
  timepointcro.tpo, 
  timepointcro.scheduled
INTO tpo_lookup
FROM 
  public.timepointcro 
WHERE
  pointtype= 'Startpoint'
ORDER BY
 tpo, route, direction, tripid;  

--1/2 hour for all busses on a route in a day
SELECT 
  servicedate, 
  tripid, 
  route, 
  direction, 
  stop,  
  tpo, 
  scheduled
FROM 
  timepointcro 
WHERE
  route = '39' AND
  direction = 'Inbound' AND
  servicedate='2015-2-23' AND
  scheduled >= '1900-01-01 08:30:00.000' AND
  scheduled < '1900-01-01 09:00:00.000' 
ORDER BY
 route, direction, tripid, tpo
LIMIT 100;

SELECT servicedate, tripid, route, direction, stop,  tpo, scheduled FROM timepointcro WHERE route = '39' AND direction = 'Inbound' AND servicedate='2015-2-23' AND scheduled >= '1900-01-01 08:30:00.000' AND scheduled < '1900-01-01 09:00:00.000'  ORDER BY route, direction, tripid, tpo;
  
SELECT DISTINCT
  servicedate
INTO servicedates  
FROM 
  timepointcro 
ORDER BY
 servicedate
LIMIT 100;