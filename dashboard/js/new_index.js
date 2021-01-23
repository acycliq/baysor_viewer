//
// General remark. Inconsistent notation all over the place. Cell_Num and cell_id, id are the same and actually
// should be removed and replaced by label (or cell_label whatever name you decide to use)
//

// Variables in the global scope
var cellBoundaries,
    cellData,
    all_geneData,
    spotsIndex, //spatial index
    dapiConfig,
    polygonsOverlay,
    cellPolygons,
    cellSpritesLayer,
    configSettings,
    cellSpitesLayer,
    cellPolyLayer,
    glyphToNeighbourLayer,
    nearbyCellLayer,
    dotLayer,
    myDots,
    cellWatch, //keeps the id of the cell currently drawn on the map
    map,
    cellContainer_array = [],
    masterCellContainer,
    masterCellRenderer,
    masterMarkerContainer,
    masterMarkerRenderer,
    geneContainer_array = [],
    // layerControl, //you sure this has to be global?
    geneLayers,
    geneOverlays,
    legendWindow,
    legend_added = false, //used to make sure the listener is attached only once
    pinnedControls = false,
    hiddenControls = false,
    myTreeControl,
    cellClasses,
    zoomSwitch = 6; // determines when the glyphs will start showing up


localStorage.clear();
console.log('Local storage cleared');


// this will be watching if something has been saved to local storage. If yes then it
// triggers some action. It acts as an intermediate layer to pass communication between the datatables grid and
// the viewer. On another browser tab, user selection on the checkboxes results in data get saved on local storage.
// This is picked up here, the javacript code reads the selected values and triggers the appropriate action
var storageMonitor = function () {
    return function () {
        var state = JSON.parse(localStorage['updated_state']);
        var enter = state.enter, // data to add
            exit = state.exit;   // data to remove

        exit.forEach(d =>{
            // 1
            _removeOverlay(d);

            // 2
            var x = masterMarkerContainer.getChildByName(d);
            if (x){
                x.visible = false
            }
            else{
                console.log("Gene: " + d + " doesn't exist in the data")
            }

        });


        enter.forEach(d => {
            // 1
            _addOverlay(d);

            // 2
            if  (map.getZoom() < zoomSwitch){
                var x = masterMarkerContainer.getChildByName(d);
                if (x) {
                    x.visible = true
                } else {
                    console.log("Gene: " + d + " doesn't exist in the data")
                }
            }
        });

        masterMarkerRenderer.render(masterMarkerContainer)

    };
}();
$(window).on("storage", storageMonitor);


function legendControl() {
    var legendLink = document.querySelector(`#legend-link`);

    if (!legend_added) {
        legendLink.addEventListener(`click`, () => {
            // Opens the page and stores the opened window instance
            legendWindow = window.open(`./dashboard/my_datatable.html`); // <--- THAT NEEDS TO BE EXPOSED TO THE USER. MOVE I INSIDE config.js MAYBE
            // legendWindow = window.open('./dashboard/my_datatable.html', '_blank','toolbar=yes');

        });
    }
    legend_added = true;

    $('#legend').show()
    console.log('legend added')
}


function closeLegend() {
    $('#legend').hide();

    if (legendWindow) {
        legendWindow.close();

        // Preventing weird behaviors
        // legendWindow = null;
    }
}


function run() {
    console.log('app starts')
    configSettings = config();
    var boundariesjson = configSettings.cellBoundaries;
    // var celljson = configSettings.cellData; // is this still needed? I dont think so...

    var q = d3.queue();
    q = q.defer(d3.json, configSettings.cellBoundaries);
    q = q.defer(d3.json, configSettings.cellData);
    q = q.defer(d3.json, configSettings.geneData);
    // for (var i = 0; i < configSettings.num_jsons; i++) {
    //     q = q.defer(d3.json, configSettings.spot_json(i));
    //     q = q.defer(d3.json, configSettings.cell_json(i));
    // }
    q.await(onCellsLoaded(configSettings));

}



function onCellsLoaded(cfg) {
    // var data_1 = [],
    //     // all_geneData = [],
    //     data_3 = [];
    return (err, ...args) => {
        console.log('loading data')
        // args.forEach((d, i) => {
        //     i === 0 ? data_1 = d : // the cell boundaries are in position 0 of the args array
        //         i % 2 === 0 ? data_3 = [...data_3, ...d] : // even positions in the args array hold the cell data
        //             all_geneData = [...all_geneData, ...d] // odd positions in the args array hold the gene data
        // });
        all_geneData = args[2];
        [cellBoundaries, cellData] = postLoad(args);
        console.log('loading data finished');
        console.log('num of genes loaded: ' + all_geneData.length);
        console.log('num of cells loaded: ' + cellData.length);


        //finaly make a spatial index on the spots. We will need that to filter them if/when needed
        console.log('Creating the index');
        spotsIndex = new KDBush(all_geneData, p => p.x, p => p.y, 64, Int32Array);

        // do now the chart
        dapiChart(cfg);
    }
}

function postLoad(arr) {
    //Do some basic post-processing/cleaning
    var _cellBoundaries = arr[0];
    // _cellBoundaries.forEach(function (row, index, arr) {
    //     arr[index].coords = JSON.parse(arr[index].coords);
    // });

    //for some reason which I havent investigated, some cells do not have boundaries. Remove those cells
    var null_coords = _cellBoundaries.filter(d => {
        return d.coords === null
    });
    if (null_coords) {
        null_coords.forEach(d => {
            console.log('Cell_id: ' + d.cell_id + ' doesnt have boundaries')
        })
    }

    // If you need to remove the cells with no boundaries uncomment the line below:
    // _cellBoundaries = _cellBoundaries.filter(d => { return d.coords != null });

    var _cellData = arr[1];

    //stick the aggregated metrics
    var agg = aggregate(_cellData);
    _cellData.forEach((d, i) => {
        d.topClass = d.ClassName[maxIndex(d.Prob)]; // Keeps the class with the highest probability
        d.agg = agg[i];
    });

    var _geneData = arr[2];

    // make sure the arrays are sorted by Cell_Num
    _cellData = _cellData.sort(function(a,b){return a.Cell_Num-b.Cell_Num});
    _cellBoundaries = _cellBoundaries.sort(function(a,b){return a.Cell_Num-b.Cell_Num});

    return [_cellBoundaries, _cellData, _geneData]
}

function maxIndex(data){
    //returns the index of the max of the input array.
    return data.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}

function aggregate(data) {
    var cellColorRamp = classColorsCodes();
    var cellColorMap = d3.map(cellColorRamp, function (d) {
        return d.className;
    });


//     for (var i = 0; i < data.length; ++i) {
//         data[i].managedData = managedData[i]
//     }
    function aggregator(data) {
        var out;
        out = d3.nest()
            .key(function (d) {
                return d.IdentifiedType;
            }) //group by IdentifiedType
            .rollup(function (leaves) {
                return {
                    Prob: d3.sum(leaves, function (d) {
                        return d.Prob;
                    }), //sum all the values with the same IdentifiedType
                    color: leaves[0].color //Get the first color code. All codes with the same IdentifiedType are the same anyway
                }
            }).entries(data)
            .map(function (d) {
                return {IdentifiedType: d.key, Prob: d.value.Prob, color: d.value.color};
            });

        // sort in decreasing order
        out.sort(function (x, y) {
            return d3.ascending(y.Prob, x.Prob);
        });

        return out
    }

    function dataManager(data) {
        var chartData = [];
        for (var i = 0; i < data.length; ++i) {
            var temp = [];
            for (var j = 0; j < data[i].ClassName.length; ++j) {
                // console.log(data[i].ClassName[j])
                temp.push({
                    IdentifiedType: cellColorMap.get(data[i].ClassName[j]).IdentifiedType,
                    color: cellColorMap.get(data[i].ClassName[j]).color,
                    Prob: data[i].Prob[j] ? data[i].Prob[j] : [data[i].Prob] //Maybe that one is better
                })
            }
            var agg = aggregator(temp);
            chartData.push({
                X: data[i].X,
                Y: data[i].Y,
                GeneCountTotal: data[i].CellGeneCount.reduce((a, b) => a + b, 0), //get the sum of all the elements in the array
                IdentifiedType: agg[0].IdentifiedType,
                color: agg[0].color,
                Prob: agg[0].Prob,
                // renderOrder: sectionFeatures.renderOrder(agg[0].IdentifiedType),

            })
        }

        return chartData
    }

    var aggData = dataManager(data);
    return aggData
}
