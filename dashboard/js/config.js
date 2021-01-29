function config() {
    return {
        roi: {"x0": 0, "x1": 9849, "y0": 0, "y1": 9875},
        imageSize: [261454, 262144],
        anchor_tiles: 'dashboard/data/img/262144px/{z}/{y}/{x}.jpg',
        cellData: './dashboard/data/TO105_20102020/cellData/cellData.json',
        geneData: './dashboard/data/TO105_20102020/geneData/geneData.json',
        cellBoundaries: i => './dashboard/data/TO105_20102020/polys/poly_' + i + '.json',
        seg_names: ['Baysor_1'],
        seg_colours: ['#009688']
    }
}


// ************ NOTES ************
// 1. Segmentations are in a json file that follows the naming convention 'poly_XX.json', where XX some incremental number.
//
// 2. Keep these jsons under the 'dashboard/data/json/polys' folder and they will be picked up automatically by the viewer.
//
// 3. You will need to add the names and the colours manually in the seg_names and seg_colours arrays
//
// 4. The length of array 'seg_names' is what defines how many segmentations will be processed by the viewer. It cannot
//    be more more that the number of json files under the folder 'dashboard/data/json/polys'. Hence if you add a new
//    poly.json in the folder then you will have to add its name in the 'seg_names' array
//*******************************

// dashboard/data/TO105_20102020/cellData/cellData.json