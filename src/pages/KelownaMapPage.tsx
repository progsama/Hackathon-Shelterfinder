import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: number;
  name: string;
  position: [number, number];
  type: string;
}

const KelownaMapPage: React.FC = () => {
  const kelownaPosition: [number, number] = [49.8880, -119.4960];
  
  const ubcoPosition: [number, number] = [49.9400, -119.3950];
  const academyWayPosition: [number, number] = [49.9200, -119.4000];
  
  const alertFireZone: [number, number][] = [
    [49.9550, -119.4100],
    [49.9500, -119.3800],
    [49.9350, -119.3700],
    [49.9150, -119.3750],
    [49.9000, -119.3850],
    [49.8950, -119.4000],
    [49.9000, -119.4150],
    [49.9100, -119.4200],
    [49.9250, -119.4150],
    [49.9400, -119.4100],
    [49.9550, -119.4100],
  ];

  const orderFireZone1: [number, number][] = [
    [49.9450, -119.4000],
    [49.9400, -119.3850],
    [49.9300, -119.3800],
    [49.9200, -119.3850],
    [49.9150, -119.3950],
    [49.9200, -119.4050],
    [49.9300, -119.4100],
    [49.9400, -119.4050],
    [49.9450, -119.4000],
  ];

  const orderFireZone2: [number, number][] = [
    [49.9250, -119.3950],
    [49.9200, -119.3900],
    [49.9150, -119.3950],
    [49.9100, -119.4000],
    [49.9100, -119.4050],
    [49.9150, -119.4100],
    [49.9200, -119.4080],
    [49.9250, -119.4000],
    [49.9250, -119.3950],
  ];

  const locations: Location[] = [
    { id: 1, name: 'Downtown Kelowna', position: [49.8880, -119.4960], type: 'Shelter' },
    { id: 2, name: 'Rutland Area', position: [49.9000, -119.4000], type: 'Shelter' },
    { id: 3, name: 'West Kelowna', position: [49.8500, -119.6000], type: 'Shelter' },
    { id: 4, name: 'Mission Area', position: [49.8700, -119.4800], type: 'Shelter' },
  ];

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', backgroundColor: '#000' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiMapPin size={24} color="#0095f6" />
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#fff' 
          }}>
            Kelowna Map
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            to="/dm" 
            style={{
              padding: '8px 16px',
              backgroundColor: '#262626',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiNavigation size={16} />
            DM Page
          </Link>
          <Link 
            to="/settings" 
            style={{
              padding: '8px 16px',
              backgroundColor: '#262626',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            Settings
          </Link>
        </div>
      </div>

      <MapContainer
        center={kelownaPosition}
        zoom={12}
        style={{ height: '100%', width: '100%', marginTop: '0' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={kelownaPosition}>
          <Popup>
            <div>
              <strong>Kelowna, British Columbia</strong>
              <p>Welcome to Kelowna!</p>
            </div>
          </Popup>
        </Marker>

        {locations.map((location) => (
          <Marker key={location.id} position={location.position}>
            <Popup>
              <div>
                <strong>{location.name}</strong>
                <p>Type: {location.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <Polygon
          positions={alertFireZone}
          pathOptions={{
            color: '#ff8c00',
            fillColor: '#ff8c00',
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <strong>Alert-Fire</strong>
              <p>Wildfire alert zone - UBCO & Academy Way Region</p>
            </div>
          </Popup>
        </Polygon>

        <Polygon
          positions={orderFireZone1}
          pathOptions={{
            color: '#ed4956',
            fillColor: '#ed4956',
            fillOpacity: 0.7,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <strong>Order-Fire</strong>
              <p>Evacuation order zone - High intensity area</p>
            </div>
          </Popup>
        </Polygon>

        <Polygon
          positions={orderFireZone2}
          pathOptions={{
            color: '#ed4956',
            fillColor: '#ed4956',
            fillOpacity: 0.7,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <strong>Order-Fire</strong>
              <p>Evacuation order zone - Academy Way area</p>
            </div>
          </Popup>
        </Polygon>

        <Marker position={academyWayPosition} icon={L.divIcon({
          html: '<div style="color: #ed4956; font-size: 24px;">🔥</div>',
          className: 'fire-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })}>
          <Popup>
            <div>
              <strong>Active Fire</strong>
              <p>Fire location detected</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={ubcoPosition}>
          <Popup>
            <div>
              <strong>UBCO</strong>
              <p>University of British Columbia Okanagan</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={academyWayPosition}>
          <Popup>
            <div>
              <strong>Academy Way</strong>
              <p>Academy Way Area</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: '16px',
        borderRadius: '12px',
        color: '#fff',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Kelowna, BC</h3>
        <p style={{ margin: '0 0 8px 0', color: '#8e8e8e', fontSize: '14px' }}>
          Explore the map to find shelters and important locations in Kelowna.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap',
          marginTop: '12px'
        }}>
          {locations.map((loc) => (
            <span 
              key={loc.id}
              style={{
                padding: '4px 8px',
                backgroundColor: '#0095f6',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              {loc.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KelownaMapPage;

