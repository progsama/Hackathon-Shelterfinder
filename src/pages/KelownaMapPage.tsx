import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
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

// Create custom thumbnail icon for memories
const createMemoryIcon = (memory: Memory, index: number): L.DivIcon => {
  const gradients = [
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)',
    'linear-gradient(135deg, #feca57 0%, #ff9ff3 50%, #c44569 100%)',
    'linear-gradient(135deg, #48dbfb 0%, #0abde3 50%, #2e86de 100%)',
    'linear-gradient(135deg, #ff9ff3 0%, #f368e0 50%, #a29bfe 100%)',
    'linear-gradient(135deg, #ff9500 0%, #ff3040 50%, #ff3040 100%)',
  ];
  
  const gradient = gradients[index % gradients.length];
  
  // Randomly vary size slightly for visual interest
  const sizes = [
    { width: 90, height: 90 },
    { width: 85, height: 85 },
    { width: 95, height: 95 },
    { width: 88, height: 88 },
  ];
  const size = sizes[index % sizes.length];
  
  const imageUrl = memory.image || '';
  const hasImage = !!imageUrl;
  const memoryId = `memory-${memory.id}`;
  
  return L.divIcon({
    className: 'memory-thumbnail-marker',
    html: `
      <div class="memory-thumbnail-wrapper" id="${memoryId}" style="
        width: ${size.width}px;
        height: ${size.height}px;
        border-radius: 14px;
        background: ${gradient};
        padding: 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <div style="
          width: 100%;
          height: 100%;
          border-radius: 10px;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        ">
          ${hasImage ? `
            <img 
              src="${imageUrl}" 
              alt="${memory.title}"
              id="${memoryId}-img"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
              "
              onerror="
                const img = document.getElementById('${memoryId}-img');
                const placeholder = document.getElementById('${memoryId}-placeholder');
                if (img) img.style.display = 'none';
                if (placeholder) placeholder.style.display = 'flex';
              "
            />
            <div 
              id="${memoryId}-placeholder"
              style="
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                position: absolute;
                top: 0;
                left: 0;
              ">📸</div>
          ` : `
            <div style="
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
            ">📸</div>
          `}
        </div>
      </div>
    `,
    iconSize: [size.width, size.height],
    iconAnchor: [size.width / 2, size.height / 2],
    popupAnchor: [0, -size.height / 2],
  });
};

// Create custom icon for SOS locations based on zone
const createSOSIcon = (zone: 'alert' | 'order1' | 'order2', _type: string): L.DivIcon => {
  const zoneColors = {
    alert: { color: '#ff3040', fill: '#ff3040' },
    order1: { color: '#ff9500', fill: '#ff9500' },
    order2: { color: '#ff9500', fill: '#ff9500' },
  };
  
  const colors = zoneColors[zone];
  
  return L.divIcon({
    className: 'sos-location-marker',
    html: `
      <div style="
        width: 0;
        height: 0;
        position: relative;
      ">
        <svg width="32" height="40" viewBox="0 0 32 40" style="
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          cursor: pointer;
        ">
          <path d="M16 0 C10 0 5 5 5 11 C5 16 16 40 16 40 C16 40 27 16 27 11 C27 5 22 0 16 0 Z" 
            fill="${colors.fill}" 
            stroke="#fff" 
            stroke-width="2"/>
          <circle cx="16" cy="14" r="5" fill="#fff"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const KelownaMapPage: React.FC = () => {
  const [mapMode, setMapMode] = useState<'map' | 'sos'>('map');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
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

  const memories: Memory[] = [
    { 
      id: 1, 
      title: 'Summer Picnic', 
      position: [49.8880, -119.4960], 
      date: '2024-07-15',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    },
    { 
      id: 2, 
      title: 'Hiking Adventure', 
      position: [49.9000, -119.4000], 
      date: '2024-08-20',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop'
    },
    { 
      id: 3, 
      title: 'Beach Day', 
      position: [49.8700, -119.4800], 
      date: '2024-09-10',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop'
    },
  ];

  // Calculate center points for fire zones
  const getZoneCenter = (zone: [number, number][]): [number, number] => {
    const latSum = zone.reduce((sum, coord) => sum + coord[0], 0);
    const lngSum = zone.reduce((sum, coord) => sum + coord[1], 0);
    return [latSum / zone.length, lngSum / zone.length];
  };

  const alertZoneCenter = getZoneCenter(alertFireZone);
  const orderZone1Center = getZoneCenter(orderFireZone1);
  const orderZone2Center = getZoneCenter(orderFireZone2);

  // SOS locations aligned to fire zones
  const sosLocations: (Location & { zone: 'alert' | 'order1' | 'order2' })[] = [
    { id: 1, name: 'Emergency Shelter', position: [alertZoneCenter[0] + 0.002, alertZoneCenter[1] + 0.002], type: 'Emergency', zone: 'alert' },
    { id: 2, name: 'Hospital', position: [alertZoneCenter[0] - 0.002, alertZoneCenter[1] + 0.002], type: 'Medical', zone: 'alert' },
    { id: 3, name: 'Police Station', position: [orderZone1Center[0] + 0.001, orderZone1Center[1] - 0.001], type: 'Safety', zone: 'order1' },
    { id: 4, name: 'Fire Station', position: [orderZone1Center[0] - 0.001, orderZone1Center[1] + 0.001], type: 'Emergency', zone: 'order1' },
    { id: 5, name: 'Evacuation Center', position: [orderZone2Center[0] + 0.001, orderZone2Center[1] + 0.001], type: 'Emergency', zone: 'order2' },
    { id: 6, name: 'Medical Aid Station', position: [orderZone2Center[0] - 0.001, orderZone2Center[1] - 0.001], type: 'Medical', zone: 'order2' },
  ];

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', backgroundColor: '#000' }}>
      <style>{`
        .memory-thumbnail-marker {
          background: transparent !important;
          border: none !important;
        }
        .memory-thumbnail-marker div {
          pointer-events: auto;
        }
        .memory-thumbnail-wrapper {
          animation: memoryPulse 3s ease-in-out infinite;
        }
        @keyframes memoryPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .memory-thumbnail-wrapper:hover {
          animation: none !important;
          transform: scale(1.1) !important;
        }
      `}</style>
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
        style={{ 
          height: 'calc(100% - 72px)', 
          width: '100%', 
          marginTop: '72px',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Fire Zones - Only show in SOS mode */}
        {mapMode === 'sos' && (
          <>
            <Polygon
              positions={alertFireZone}
              pathOptions={{
                color: '#ff3040',
                fillColor: '#ff3040',
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>Fire Alert Zone</strong>
                  <p>High risk area - evacuation may be required</p>
                </div>
              </Popup>
            </Polygon>
            
            <Polygon
              positions={orderFireZone1}
              pathOptions={{
                color: '#ff9500',
                fillColor: '#ff9500',
                fillOpacity: 0.25,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>Evacuation Order Zone 1</strong>
                  <p>Evacuation order in effect</p>
                </div>
              </Popup>
            </Polygon>
            
            <Polygon
              positions={orderFireZone2}
              pathOptions={{
                color: '#ff9500',
                fillColor: '#ff9500',
                fillOpacity: 0.25,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>Evacuation Order Zone 2</strong>
                  <p>Evacuation order in effect</p>
                </div>
              </Popup>
            </Polygon>
          </>
        )}

        {/* Memory Markers - Only show in map mode */}
        {mapMode === 'map' && memories.map((memory, index) => (
          <Marker 
            key={memory.id} 
            position={memory.position}
            icon={createMemoryIcon(memory, index)}
            eventHandlers={{
              click: () => setSelectedMemory(memory)
            }}
          >
            <Popup>
              <div>
                <strong>{memory.title}</strong>
                <p>Date: {memory.date}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Location Markers - Show in both modes */}
        {mapMode === 'map' && locations.map((location) => (
          <Marker key={location.id} position={location.position}>
            <Popup>
              <div>
                <strong>{location.name}</strong>
                <p>Type: {location.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* SOS Location Markers - Only show in SOS mode, aligned to zones */}
        {mapMode === 'sos' && sosLocations.map((location) => (
          <Marker 
            key={location.id} 
            position={location.position}
            icon={createSOSIcon(location.zone, location.type)}
          >
            <Popup>
              <div>
                <strong>{location.name}</strong>
                <p>Type: {location.type}</p>
                <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                  Zone: {location.zone === 'alert' ? 'Alert Zone' : location.zone === 'order1' ? 'Order Zone 1' : 'Order Zone 2'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
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

      {/* Memory Story Viewer Modal */}
      {selectedMemory && (
        <div
          onClick={() => setSelectedMemory(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid #262626',
              cursor: 'default'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#fff' }}>
                {selectedMemory.title}
              </h2>
              <button
                onClick={() => setSelectedMemory(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#262626';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              width: '100%',
              height: '300px',
              backgroundColor: '#262626',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              overflow: 'hidden',
              position: 'relative',
              background: selectedMemory.image 
                ? 'transparent' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              {selectedMemory.image ? (
                <img 
                  src={selectedMemory.image} 
                  alt={selectedMemory.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: selectedMemory.image ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: 0,
                left: 0
              }}>
                <FiHeart size={48} color="#fff" />
              </div>
            </div>
            <div style={{ color: '#8e8e8e', fontSize: '14px', marginBottom: '8px' }}>
              Date: {selectedMemory.date}
            </div>
            <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.6' }}>
              This memory was created at this location. Tap the map marker to see more details.
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#262626',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#8e8e8e'
            }}>
              Location: {selectedMemory.position[0].toFixed(4)}, {selectedMemory.position[1].toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelownaMapPage;

