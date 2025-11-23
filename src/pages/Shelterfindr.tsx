import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiHeart } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Memory {
  id: number;
  title: string;
  position: [number, number];
  date: string;
  image?: string;
}

interface Location {
  id: number;
  name: string;
  position: [number, number];
  type: string;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
        position: relative;
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

interface ShelterfindrProps {
  kelownaPosition: [number, number];
  memories: Memory[];
  locations: Location[];
  selectedMemory: Memory | null;
  onMemorySelect: (memory: Memory | null) => void;
}

const Shelterfindr: React.FC<ShelterfindrProps> = ({
  kelownaPosition,
  memories,
  locations,
  selectedMemory,
  onMemorySelect,
}) => {
  return (
    <>
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
          transform: scale(1.15) translateY(-4px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
          z-index: 1000 !important;
        }
      `}</style>
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
        
        {/* Memory Markers */}
        {memories.map((memory, index) => (
          <Marker 
            key={memory.id} 
            position={memory.position}
            icon={createMemoryIcon(memory, index)}
            eventHandlers={{
              click: () => onMemorySelect(memory)
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

        {/* Location Markers */}
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
      </MapContainer>

      {/* Info Panel */}
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

      {/* Memory Story Viewer Modal */}
      {selectedMemory && (
        <div
          onClick={() => onMemorySelect(null)}
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
                onClick={() => onMemorySelect(null)}
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
    </>
  );
};

export default Shelterfindr;

