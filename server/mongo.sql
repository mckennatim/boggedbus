db.geo_routes.find({}, {route:1, dir:1, headsign:1}).sort({route:1, dir:1, headsign:1}).forEach(function(doc){db.routes.insert(doc)}

db.routes.find({route:1, dir:1,  collection: {$elemMatch: {type: 'FeatureCollection'}} }).pretty()