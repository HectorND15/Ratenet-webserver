var center = [ 11.0190722, -74.8508113 ];
var map = L.map('map').setView(center, 18);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
   attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



function getColor(value) {
   var colors = {
         2: 'red',
         3: 'yellow',
         5: 'green'
   };

   if (value <= 2) return colors[2];
   if (value >= 5) return colors[5];

   var r, g, b = 0;
   if (value < 3) {
         // Interpolar entre rojo y amarillo
         r = 255;
         g = Math.floor(255 * (value - 2));
   } else {
         // Interpolar entre amarillo y verde
         r = Math.floor(255 * (1 - (value - 3) / 2));
         g = 255;
   }

   return `rgb(${r},${g},${b})`;
}

function createCircleMarker(lat, lng, value) {
   return L.circleMarker([lat, lng], {
         radius: 30, // Tamaño más grande
         fillColor: getColor(value),
         fillOpacity: 0.5,
         color: '#000' // Sin borde negro
   }).addTo(map);
}

   function fetchData(tableName) {
      fetch(`/get-map-data?table=${tableName}`)
         .then(response => response.json())
         .then(data => {
            data.forEach(item => {
               createCircleMarker(item.latitude, item.longitude, item.rating);
            });
         })
         .catch(err => console.error(err));
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

