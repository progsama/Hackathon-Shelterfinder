import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiHeart, FiAlertCircle } from 'react-icons/fi';
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

interface Memory {
  id: number;
  title: string;
  position: [number, number];
  date: string;
  image?: string;
}

const KelownaMapPage: React.FC = () => {
  const [mapMode, setMapMode] = useState<'map' | 'sos'>('map');
  const kelownaPosition: [number, number] = [49.8880, -119.4960];

  const locations: Location[] = [
    { id: 1, name: 'Downtown Kelowna', position: [49.8880, -119.4960], type: 'Shelter' },
    { id: 2, name: 'Rutland Area', position: [49.9000, -119.4000], type: 'Shelter' },
    { id: 3, name: 'West Kelowna', position: [49.8500, -119.6000], type: 'Shelter' },
    { id: 4, name: 'Mission Area', position: [49.8700, -119.4800], type: 'Shelter' },
  ];

  const memories: Memory[] = [
    { id: 1, title: 'Summer Picnic', position: [49.8880, -119.4960], date: '2024-07-15' },
    { id: 2, title: 'Hiking Adventure', position: [49.9000, -119.4000], date: '2024-08-20' },
    { id: 3, title: 'Beach Day', position: [49.8700, -119.4800], date: '2024-09-10' },
  ];

  const sosLocations: Location[] = [
    { id: 1, name: 'Emergency Shelter', position: [49.8880, -119.4960], type: 'Emergency' },
    { id: 2, name: 'Hospital', position: [49.9000, -119.4000], type: 'Medical' },
    { id: 3, name: 'Police Station', position: [49.8500, -119.6000], type: 'Safety' },
    { id: 4, name: 'Fire Station', position: [49.8700, -119.4800], type: 'Emergency' },
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

        {mapMode === 'map' ? (
          <>
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
            {memories.map((memory) => (
              <Marker key={`memory-${memory.id}`} position={memory.position}>
                <Popup>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FiHeart size={16} color="#ff3040" />
                      <strong>{memory.title}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{memory.date}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        ) : (
          <>
            {sosLocations.map((location) => (
              <Marker key={`sos-${location.id}`} position={location.position}>
                <Popup>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FiAlertCircle size={16} color="#ff3040" />
                      <strong>{location.name}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Type: {location.type}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>

      {/* Instagram-style Toggle Button */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '4px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={() => setMapMode('map')}
          style={{
            padding: '10px 24px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: mapMode === 'map' ? '#fff' : 'transparent',
            color: mapMode === 'map' ? '#000' : '#fff',
            fontSize: '15px',
            fontWeight: mapMode === 'map' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (mapMode !== 'map') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (mapMode !== 'map') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <FiMapPin size={16} />
          Map
        </button>
        <button
          onClick={() => setMapMode('sos')}
          style={{
            padding: '10px 24px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: mapMode === 'sos' ? '#fff' : 'transparent',
            color: mapMode === 'sos' ? '#000' : '#fff',
            fontSize: '15px',
            fontWeight: mapMode === 'sos' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (mapMode !== 'sos') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (mapMode !== 'sos') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <FiAlertCircle size={16} />
          SOS
        </button>
      </div>

      {/* Info Panel */}
      {mapMode === 'map' && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '16px',
          borderRadius: '16px',
          color: '#fff',
          maxWidth: '300px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'opacity 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Kelowna, BC</h3>
          <p style={{ margin: '0 0 12px 0', color: '#a8a8a8', fontSize: '14px', lineHeight: '1.4' }}>
            Explore the map to find shelters and view your memories.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            marginTop: '12px'
          }}>
            {memories.map((memory) => (
              <span 
                key={memory.id}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 48, 64, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255, 48, 64, 0.3)'
                }}
              >
                <FiHeart size={12} color="#ff3040" />
                {memory.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {mapMode === 'sos' && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 48, 64, 0.15)',
          padding: '16px',
          borderRadius: '16px',
          color: '#fff',
          maxWidth: '300px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 48, 64, 0.3)',
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiAlertCircle size={20} color="#ff3040" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Emergency Services</h3>
          </div>
          <p style={{ margin: '0 0 12px 0', color: '#ffb3b8', fontSize: '14px', lineHeight: '1.4' }}>
            Find emergency services, hospitals, and safety locations near you.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            marginTop: '12px'
          }}>
            {sosLocations.map((loc) => (
              <span 
                key={loc.id}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 48, 64, 0.3)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid rgba(255, 48, 64, 0.5)'
                }}
              >
                {loc.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KelownaMapPage;

