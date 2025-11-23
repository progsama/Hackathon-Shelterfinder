import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapRefSetterProps {
  onMapReady: (map: L.Map) => void;
}

const MapRefSetter: React.FC<MapRefSetterProps> = ({ onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

export default MapRefSetter;

