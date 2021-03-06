function config() {
    return {
            roi: {"x0": 0, "x1": 9496, "y0": 0, "y1": 7674},
            imageSize: [262144, 211846],
            anchor_tiles: 'dashboard/data/img/262144px_anchor/{z}/{y}/{x}.jpg',
            flipped_tiles: 'dashboard/data/img/262144px_flipped/{z}/{y}/{x}.jpg',
            cellData: 'https://api.github.com/repos/acycliq/baysor_viewer/contents/dashboard/data/tsv/cellData',
            geneData: 'https://api.github.com/repos/acycliq/baysor_viewer/contents/dashboard/data/tsv/geneData',
            cellCoords: 'https://api.github.com/repos/acycliq/baysor_viewer/contents/dashboard/data/tsv/cellCoords',
            class_name_separator: '.' //The delimiter in the class name string, eg if name is Astro.1, then use the dot as a separator, if Astro1 then use an empty string. It is used in a menu/control to show the class names nested under its broader name
        }
}
