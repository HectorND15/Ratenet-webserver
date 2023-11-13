import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import icon from '@/assets/location-pin.svg';
import icon_center from '@/assets/ic-center.svg';

function MapComponent() {
   const mapRef = useRef(null);
   const [userPosition, setUserPosition] = useState(null);
   const [map, setMap] = useState(null);
   const [isCentered, setIsCentered] = useState(true);

   // Function to get the user's location
   const getUserLocation = () => {
      navigator.geolocation.getCurrentPosition(
         (position) => {
            const { latitude, longitude } = position.coords;
            setUserPosition([latitude, longitude]);
         },
         () => {
            console.error("Failed to get user location. Using default location.");
            const defaultLatitude = 11.0190513;
            const defaultLongitude = -74.8511425;
            setUserPosition([defaultLatitude, defaultLongitude]);
         }
      );
   };

   const centerMap = () => {
      if (map && userPosition) {
         map.setView(userPosition, map.getZoom());
         setIsCentered(true);
      }
   };

   useEffect(() => {
      getUserLocation();
   }, []);

   useEffect(() => {
      if (mapRef.current === null || userPosition === null) return;

      const newMap = L.map(mapRef.current, {
         zoomControl: false,
         attributionControl: false,
         center: userPosition,
         zoom: 16,
         maxZoom: 18,
         minZoom: 4,
         maxBounds: [
            [-90, -180],
            [90, 180],
         ],
      }).setView(userPosition, 16);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(newMap);
      
      var blueMarker = L.icon({
         iconUrl: icon,
         iconSize: [30,30],
         iconAnchor: [15,30]
      });

      L.marker(userPosition, { icon: blueMarker }).addTo(newMap);

      newMap.on('moveend', () => {
         const currentCenter = newMap.getCenter();
         setIsCentered(currentCenter.lat === userPosition[0] && currentCenter.lng === userPosition[1]);
      });

      setMap(newMap);

      return () => {
         newMap.remove();
      };
   }, [userPosition]);

   return (
      <div ref={mapRef} className='h-screen w-screen'>
         {!isCentered && (
            <div className='rounded-md bg-orange-200 flex flex-col absolute top-[15px] p-2 right-[15px] z-[1000] border-spacing-1'>
               <button onClick={centerMap}>
                  <img src={icon_center} alt="10" className='h-8' />
               </button>
            </div>
         )}
      </div>
   );
}

export default MapComponent;
