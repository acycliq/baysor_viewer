function poly_collection(data, t, id) {
    console.log('Doing geojson object for polygons');
    // index_obj.get(id).index = new Flatbush(data.length);

    var polys = {
        type: "FeatureCollection",
        features: []
    };
    for (var i = 0; i < data.length; ++i) {
        var c = data[i].coords,
            temp = [];
        // if (data[i].cell_id === 737) {
        //     console.log('stop')
        // }
        if (c) {
            // That needs some attention. It leaves an open bug
            // if c is null (ie a cell doesnt have boundary coords for some reason) then
            // the geometry g which will be attached to data[i] will be the previous point's (ie data[i-1]) geometry,
            // I am turning a blind eye cause I dont have too many such cells (in fact all cells should have boundaries)
            // but it is a bug!
            for (var j = 0; j < c.length; ++j) {
                var x = c[j][0],
                    y = c[j][1];
                var lp = t.transform(L.point([x, y]));
                temp.push([lp.x, lp.y])
            }
            var g = {
                "type": "Polygon",
                "coordinates": [temp]
            };
        }

        //create feature properties
        var p = {
            "id": id,
        };

        //create features with proper geojson structure
        polys.features.push({
            "geometry": g,
            "type": "Feature",
            "properties": p
        });

        var minX = Math.min(...g.coordinates[0].map(d => d[0])),
            minY = Math.min(...g.coordinates[0].map(d => d[1])),
            maxX = Math.max(...g.coordinates[0].map(d => d[0])),
            maxY = Math.max(...g.coordinates[0].map(d => d[1]));

        // index_obj.get(id).index.add(minX, minY, maxX, maxY)
    }
    console.log('geojson done');
    // index_obj.get(id).index.finish();
    return polys;
}

