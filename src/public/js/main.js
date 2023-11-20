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

var dataA = [];
function fetchData(tableName) {
   fetch(`/get-map-data?table=${tableName}`)
      .then(response => response.json())
      .then(data => {
         hexLayer.data(data.map(function(d) { return [d.longitude, d.latitude, d.calc_mos]; }));
         map.addLayer(hexLayer);
         
      })
      .catch(err => console.log(err));
      
}

function setupDropdownAndButton() {
   // Fetch table names and populate dropdown
   fetch('/get-table-names')
         .then(response => response.json())
         .then(tables => {
            const select = document.createElement('select');
            tables.forEach(table => {
               const option = document.createElement('option');
               option.value = table;
               option.textContent = table;
               select.appendChild(option);
            });

            const button = document.createElement('button');
            button.textContent = 'Search';
            button.onclick = () => fetchData(select.value);

            // Add the select and button to a container on the map
            const container = L.control({position: 'topright'});
            container.onAdd = function () {
               const div = L.DomUtil.create('div', 'table-select-container');
               div.appendChild(select);
               div.appendChild(button);
               return div;
            };
            container.addTo(map);
         })
         .catch(error => console.error('Error:', error));
}

setupDropdownAndButton();

