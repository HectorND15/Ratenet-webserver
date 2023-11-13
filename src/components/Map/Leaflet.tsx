import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import icon from '@/assets/location-pin.svg';

function MapComponent() {
   const mapRef = useRef(null);
   const [userPosition, setUserPosition] = useState(null);

   // Function to get the user's location
   const getUserLocation = () => {
      navigator.geolocation.getCurrentPosition(
         (position) => {
            const { latitude, longitude } = position.coords;
            setUserPosition([latitude, longitude]);
         },
         () => {
            console.error("Failed to get user location. Using default location.");
            const defaultLatitude = 11.0190513; // Set default latitude
            const defaultLongitude = -74.8511425; // Set default longitude
            setUserPosition([defaultLatitude, defaultLongitude]);
         }
      );
   };

   useEffect(() => {
      getUserLocation();
   }, []);

   useEffect(() => {
      if (mapRef.current === null || userPosition === null) return;

      const map = L.map(mapRef.current).setView(userPosition, 16);

      L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {

      }).addTo(map);
      
      var blueMarker = L.icon({
         iconUrl: icon,
         iconSize: [30,30],
         iconAnchor: [15,30]
      })
      L.marker(userPosition, {
         icon: blueMarker
      }).addTo(map);

      return () => {
         map.remove();
      };
   }, [userPosition]);

   return <div ref={mapRef} className='h-screen w-screen' />;
}

export default MapComponent;
