function config() {
    return {
        roi: {"x0": 0, "x1": 9496, "y0": 0, "y1": 7674},
        imageSize: [262144, 211846],
        anchor_tiles: 'dashboard/data/img/262144px_anchor/{z}/{y}/{x}.jpg',
        cellData: './dashboard/data/tsv/cellData/cellData.json',
        geneData: './dashboard/data/tsv/geneData/geneData.json',
        cellBoundaries: i => 'http://localhost:63342/baysor_viewer/dashboard/data/json/polys/poly_' + i + '.json',
        seg_names: ['Baysor_1', 'Baysor_2', 'Baysor_3'],
        seg_colours: ['#009688', '#2944cc', '#ff0101']
    }
}


// ************ NOTES ************
// 1. Segmentations are in a json file that follows the naming convention 'poly_XX.json', where XX some incremental number.
//
// 2. Keep these jsons under the 'dashboard/data/json/polys' folder and they will be picked up automatically by the viewer.
//
// 3. You will need to add the names and the colours manually in the seg_names and seg_colours arrays
//*******************************

