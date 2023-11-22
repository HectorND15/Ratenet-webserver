var center = [ 11.0190722, -74.8508113 ];
var map = L.map('map').setView(center, 18);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
   attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



function getColor(value) {
   var r = 255;
   var g = 0;
   var b = 0;

   if (value <= 2) {
       // Valores menores o iguales a 2 serán rojos
       g = Math.floor(255 * (value - 1) / 1); // Interpola entre rojo y amarillo
   } else if (value <= 5) {
       // Valores entre 2 y 5
       r = Math.floor(255 * (5 - value) / 3); // Interpola entre amarillo y verde
       g = 255;
   }

   var fillColor = `rgb(${r},${g},${b})`;
   var borderColor = `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
   return { fillColor, borderColor };
}return { fillColor, borderColor };


function createCircleMarker(lat, lng, value) {
   var colors = getColor(value);
   var marker = L.circleMarker([lat, lng], {
         radius: 30,
         fillColor: colors.fillColor,
         fillOpacity: 0.5,
         color: colors.borderColor,
         weight: 2
   }).addTo(map);

   // Agrega un tooltip
   marker.bindTooltip(`MOS = ${value}`, { permanent: false, direction: "top" });

   return marker;
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

