var center = [ 11.0190722, -74.8508113 ];
var map = L.map('map').setView(center, 18);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 18,
   attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var currentMarkers = [];

function getColor(value) {
   let r = 255;
   let g = 0;
   let b = 0;

   if (value < 2.2) {
       // Rojo para valores menores a 2.2
       g = 0;
   } else if (value < 4.3) {
       // Interpolar entre rojo y verde
       g = Math.floor(255 * (value - 2.2) / 2.1);
       r = 255 - g;
   } else {
       // Verde para valores de 4.3 en adelante
       r = 0;
       g = 255;
   }

   var fillColor = `rgb(${r},${g},${b})`;
   var borderColor = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;

   return { fillColor, borderColor };
}


function createCircleMarker(lat, lng, value) {
   var colors = getColor(value);
   var marker = L.circleMarker([lat, lng], {
         radius: 30,
         fillColor: colors.fillColor,
         fillOpacity: 0.5,
         color: colors.borderColor,
         weight: 2
   }).addTo(map);

   marker.bindTooltip(`MOS = ${value}`, { permanent: false, direction: "top" });
   return marker;
}

function fetchData(tableName, columnName) {
   currentMarkers.forEach(marker => map.removeLayer(marker));
   currentMarkers = [];

   fetch(`/get-map-data?table=${tableName}&column=${columnName}`)
      .then(response => response.json())
      .then(data => {
         data.forEach(item => {
            console.log(item);
            value = item.rating;
            if (item.rating === undefined) value = item.calc_mos;
            console.log(value);
            var marker = createCircleMarker(item.latitude, item.longitude, value);
            currentMarkers.push(marker);
         });
      })
      .catch(err => console.error(err));
}

function setupDropdownAndButton() {
   fetch('/get-table-names')
      .then(response => response.json())
      .then(tables => {
         const select = document.createElement('select');
         tables.forEach(table => {
            const option = document.createElement('option');
            const displayName = table.replace(/_mos$/, '');
            option.value = table;
            option.textContent = displayName.toUpperCase();
            select.appendChild(option);
         });

         const button = document.createElement('button', 'table-select-button');
         button.textContent = 'Buscar';
         button.onclick = () => {
            const columnName = checkbox.checked ? 'calc_mos' : 'rating';
            fetchData(select.value, columnName);
         };

         // Create checkbox for "MOS Calculado"
         const checkbox = document.createElement('input');
         checkbox.type = 'checkbox';
         checkbox.id = 'mosCalculated';
         checkbox.name = 'mosCalculated';

         // Create label for the checkbox
         const label = document.createElement('label');
         label.htmlFor = 'mosCalculated';
         label.textContent = 'MOS Calculado';

         const container = L.control({position: 'bottomleft'});
         container.onAdd = function () {
            const div = L.DomUtil.create('div', 'table-select-container');
            div.appendChild(select);
            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(button);
            return div;
         };
         container.addTo(map);
      })
      .catch(error => console.error('Error:', error));
}

setupDropdownAndButton();
