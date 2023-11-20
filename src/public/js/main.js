// const map = L.map('map', {zoomControl: true}).setView([11.02130401,-74.85207962], 17);


// googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
//    maxZoom: 20,
//    subdomains:['mt0','mt1','mt2','mt3']
// });
// googleTerrain.addTo(map);
// // var hexLayer = L.hexbinLayer({ duration: 400, radiusRange: [ 5, 11 ] })
// //    .radiusValue(function(d) { return d.length; })
// //    .hoverHandler(L.HexbinHoverHandler.compound({
// //       handlers: [
// //          L.HexbinHoverHandler.resizeFill(),
// //          L.HexbinHoverHandler.tooltip()
// //       ]
// //    }));


var center = [ 11.0190722,-74.8508113 ];
var layer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
   attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var map = L.map('map', {
   layers: [ layer ],
   center: L.latLng(center[0], center[1]),
   zoom: 18,
   zoomSnap: 0.25,

});

var options = {
   radiusRange: [5, 20],
   opacity: 0.4,

   colorScaleExtent: [1, 5],
   colorRange: ['red', 'orange', 'yellow', 'lightgreen', 'green'],
};

// Create the hexlayer
var hexLayer = L.hexbinLayer(options).addTo(map);

var data = [
   { location: [11.019703, -74.851488], value: 5 },
   { location: [11.019451, -74.849810], value: 5 },
];

hexLayer.data(data.map(function(d) { return [d.location[1], d.location[0], d.value]; }));
map.addLayer(hexLayer);
