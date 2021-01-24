function config() {
    return {
            roi: {"x0": 0, "x1": 9496, "y0": 0, "y1": 7674},
            imageSize: [262144, 211846],
            anchor_tiles: 'dashboard/data/img/262144px_anchor/{z}/{y}/{x}.jpg',
            cellData: './dashboard/data/tsv/cellData/cellData.json',
            geneData: './dashboard/data/tsv/geneData/geneData.json',
            cellBoundaries: i => 'http://localhost:63342/baysor_viewer/dashboard/data/tsv/cellCoords/cellCoords_' + i + '.json',
            seg_names: ['Baysor_1', 'Baysor_2', 'Baysor_3'],
            seg_colours: ['#009688', '#2944cc', '#ff0101']
    }
}
