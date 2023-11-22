var center = [ 11.0190722, -74.8508113 ];
var map = L.map('map').setView(center, 18);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
   attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getColor(value) {
   // ... código existente para calcular el color basado en el valor ...

   var fillColor = `rgb(${r},${g},${b})`;
   // Oscurece el color para el borde
   var borderColor = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;
   return { fillColor, borderColor };
}

function createCircleMarker(lat, lng, value) {
   var colors = getColor(value);
   var marker = L.circleMarker([lat, lng], {
       radius: 10,
       fillColor: colors.fillColor,
       fillOpacity: 0.8,
       color: colors.borderColor,
       weight: 2
   }).addTo(map);

   // Agrega un tooltip
   marker.bindTooltip(`MOS = ${value}`, { permanent: false, direction: "top" });

   return marker;
}

// fetchData se mantiene igual


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

