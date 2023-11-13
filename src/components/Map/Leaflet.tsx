import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

function MapComponent() {
   const mapRef = useRef(null);
   const [userPosition, setUserPosition] = useState(null);

   // Función para obtener la ubicación del usuario
   const getUserLocation = () => {
      navigator.geolocation.getCurrentPosition(
         (position) => {
            const { latitude, longitude } = position.coords;
            setUserPosition([latitude, longitude]);
         },
         () => {
            console.error("No se pudo obtener la ubicación del usuario.");
         }
      );
   };

   useEffect(() => {
      getUserLocation();
   }, []);

   useEffect(() => {
      if (mapRef.current === null || userPosition === null) return;

      // Crear el mapa y centrarlo en la ubicación del usuario
      const map = L.map(mapRef.current).setView(userPosition, 13);

      // Añadir capa de mapa base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Añadir marcador en la ubicación del usuario
      L.marker(userPosition).addTo(map);

      // Limpieza al desmontar el componente
      return () => {
         map.remove();
      };
   }, [userPosition]);

   return <div ref={mapRef} className='h-screen w-screen' />;
}

export default MapComponent;
