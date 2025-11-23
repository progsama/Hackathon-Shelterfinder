import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import MapController from '../components/MapController';
import MapRefSetter from '../components/MapRefSetter';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiHeart, FiAlertCircle, FiPhone, FiExternalLink, FiX, FiUsers, FiUser, FiUserCheck } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
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

interface Shelter {
  id: number;
  operator: string;
  address: string;
  position: [number, number];
  type: string;
  beds: number;
  phone: string;
  website?: string;
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

// Create custom icon for SOS locations based on type
const createSOSIcon = (type: string): L.DivIcon => {
  const getColorForType = (serviceType: string): string => {
    if (serviceType.includes('Hospital') || serviceType.includes('Urgent')) return '#ff3040';
    if (serviceType.includes('Fire')) return '#ff9500';
    if (serviceType.includes('Police')) return '#3b82f6';
    if (serviceType.includes('Medical') || serviceType.includes('clinic')) return '#10b981';
    return '#8b5cf6';
  };
  
  const color = getColorForType(type);
  
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
            fill="${color}" 
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

// Create green house icon for shelters
const createShelterIcon = (): L.DivIcon => {
  return L.divIcon({
    className: 'shelter-marker',
    html: `
      <div style="
        width: 0;
        height: 0;
        position: relative;
      ">
        <svg width="28" height="28" viewBox="0 0 28 28" style="
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          cursor: pointer;
        ">
          <!-- House roof -->
          <path d="M14 2 L4 10 L4 24 L10 24 L10 16 L18 16 L18 24 L24 24 L24 10 Z" 
            fill="#22c55e" 
            stroke="#fff" 
            stroke-width="1.5"/>
          <!-- Door -->
          <rect x="12" y="18" width="4" height="6" fill="#fff" opacity="0.8"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

interface EmergencyService {
  id: number;
  name: string;
  type: string;
  address: string;
  position: [number, number];
  phone?: string;
}

type LocationSharingType = 'public' | 'close-friends' | 'individuals' | 'none';

const KelownaMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [mapMode, setMapMode] = useState<'map' | 'sos'>('map');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [locationSharing, setLocationSharing] = useState<LocationSharingType>('none');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSOSConfirmation, setShowSOSConfirmation] = useState(false);
  const [sosRecipientsCount, setSosRecipientsCount] = useState(0);
  const kelownaPosition: [number, number] = [49.8880, -119.4960];
  
  
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


  const emergencyServices: EmergencyService[] = [
    { id: 1, name: 'Kelowna Urgent and Primary Care Centre (UPCC)', type: 'Hospitals', address: '1141 Harvey Ave, Kelowna, BC V1Y 6E8', position: [49.8814, -119.4771], phone: '+12504696985' },
    { id: 2, name: 'Interior Health – Kelowna General Hospital', type: 'Hospitals', address: '2268 Pandosy Street, Kelowna, BC V1Y 1T2', position: [49.8700, -119.4850], phone: '250-862-4000' },
    { id: 3, name: 'Orchard Medical Centre', type: 'Hospitals', address: '1990 Cooper Rd, Kelowna, BC V1Y 8K5', position: [49.8750, -119.4750], phone: '250-763-3333' },
    { id: 4, name: 'Glenvalley Medical Centre', type: 'Hospitals', address: '437 Glenmore Rd #207, Kelowna, BC V1V', position: [49.9200, -119.4200], phone: '250-762-3333' },
    { id: 5, name: 'Lakeshore Medical Centre', type: 'Hospitals', address: '2280 Baron Rd, Kelowna, BC V1X 7W3', position: [49.9100, -119.4400], phone: '250-765-3333' },
    { id: 6, name: 'Kelowna Fire Department Station #1', type: 'Fire station', address: '2255 Enterprise Way, Kelowna, BC V1Y 8B8', position: [49.8850, -119.4700], phone: '250-469-8801' },
    { id: 7, name: 'Kelowna Fire Department Station #3', type: 'Fire station', address: '310 Rutland Rd N, Kelowna, BC V1X 3B2', position: [49.9000, -119.4000], phone: '250-469-8803' },
    { id: 8, name: 'Kelowna Fire Department Station #2', type: 'Fire station', address: '1616 Water St, Kelowna, BC V1Y 1J9', position: [49.8880, -119.4950], phone: '250-469-8802' },
    { id: 9, name: 'City Of Kelowna Police Services', type: 'Police Stations', address: '1170 Richter St, Kelowna, BC V1Y 2K7', position: [49.8900, -119.4940], phone: '250-762-3300' },
    { id: 10, name: 'Rutland Community Policing Office', type: 'Police Stations', address: '115 McIntosh Rd, Kelowna, BC V1X 3B2', position: [49.9000, -119.4000], phone: '250-762-3300' },
    { id: 11, name: 'Central Okanagan HP', type: 'Police Stations', address: '2611 Norris Rd, Kelowna, BC V1X 7W5', position: [49.9100, -119.4300], phone: '250-762-3300' },
  ];

  const serviceTypes = Array.from(new Set(emergencyServices.map(s => s.type))).sort();
  const allCategories = [...serviceTypes, 'Shelters'].sort();

  const toggleFilter = (filterType: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterType)) {
      newFilters.delete(filterType);
    } else {
      newFilters.add(filterType);
    }
    setSelectedFilters(newFilters);
  };

  const filteredServices = selectedFilters.size === 0 
    ? emergencyServices 
    : emergencyServices.filter(service => selectedFilters.has(service.type));

  // Shelter data from screenshots
  const shelters: Shelter[] = [
    {
      id: 1,
      operator: 'John Howard Society of Okanagan & Kootenay',
      address: '425 Leon Ave, Kelowna, V1Y 6J4',
      position: [49.8880, -119.4960], // Approximate coordinates for Leon Ave
      type: 'Temporary Shelter - All clients 19+',
      beds: 80,
      phone: '250-317-6678',
      website: 'http://www.johnhowardbc.ca/regions/cso/welcome/'
    },
    {
      id: 2,
      operator: 'Turning Points Collaborative Society',
      address: '1083 Richter Street, Kelowna, V1Y 2K6',
      position: [49.8900, -119.4940], // Approximate coordinates for Richter St
      type: 'Year-Round Shelters - All Clients 19+',
      beds: 48,
      phone: '778-212-1401',
      website: 'http://turningpoints.ngo/'
    },
    {
      id: 3,
      operator: 'New Opportunities for Women (NOW) Canada Society',
      address: '2609 Richter Street, Kelowna, V1Y 2R3',
      position: [49.8950, -119.4920], // Approximate coordinates for Richter St
      type: 'Year-Round Shelters - Women and children',
      beds: 20,
      phone: '250-763-2262',
      website: 'www.nowcanada.ca'
    },
    {
      id: 4,
      operator: 'Okanagan Boys and Girls Clubs',
      address: '1633 Richter Street, Kelowna, V1Y 9T7',
      position: [49.8920, -119.4930], // Approximate coordinates for Richter St
      type: 'Temporary Shelter - Young Adults (19-24 Years Old)',
      beds: 5,
      phone: '(250) 718-7620'
    },
    {
      id: 5,
      operator: 'Turning Points Collaborative Society',
      address: '2500 Bartley Court, West Kelowna, V1Z 2M8',
      position: [49.8500, -119.6000], // Approximate coordinates for West Kelowna
      type: 'Year-Round Shelters - All Clients 19+',
      beds: 38,
      phone: '778-212-1401',
      website: 'http://turningpoints.ngo/'
    },
    {
      id: 6,
      operator: 'Kelowna Gospel Mission Society',
      address: '858 Ellis Street, Kelowna, V1W 0A1',
      position: [49.8860, -119.4980], // Approximate coordinates for Ellis St
      type: 'Temporary Shelter - All Clients 19+',
      beds: 72,
      phone: '(236) 420-0899'
    },
    {
      id: 7,
      operator: 'Turning Points Collaborative Society',
      address: 'Kelowna, BC',
      position: [49.8880, -119.4950], // Approximate coordinates
      type: 'Temporary Shelter - All Clients 19+',
      beds: 30,
      phone: '778-583-3093'
    },
    {
      id: 8,
      operator: 'Kelowna Gospel Mission Society',
      address: '251 Leon Avenue, Kelowna, V1Y 6J1',
      position: [49.8880, -119.4960], // Approximate coordinates for Leon Ave
      type: 'Year-Round Shelters - Men 19+ only',
      beds: 60,
      phone: '250-763-3737',
      website: 'http://www.kelownagospelmission.ca'
    },
    {
      id: 9,
      operator: 'New Opportunities for Women (NOW) Canada Society',
      address: '1069 Gordon Drive, Kelowna, V1Y 3E3',
      position: [49.8700, -119.4800], // Approximate coordinates for Gordon Dr
      type: 'Year-Round Shelters - Women and Children',
      beds: 20,
      phone: '778-484-9927',
      website: 'https://www.nowcanada.ca'
    }
  ];

  const filteredShelters = selectedFilters.has('Shelters') ? shelters : [];

  useEffect(() => {
    if (mapRef) {
      setTimeout(() => {
        mapRef.invalidateSize();
      }, 100);
    }
  }, [selectedFilters, mapRef]);

  const handleGetDirectionsShelter = (shelter: Shelter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.position[0]},${shelter.position[1]}`;
    window.open(url, '_blank');
  };

  const handleReserveSpots = (shelter: Shelter) => {
    navigate('/reservation', { state: { shelter } });
  };

  const handleGetDirectionsService = (service: EmergencyService) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.position[0]},${service.position[1]}`;
    window.open(url, '_blank');
  };

  const handleViewOnGoogle = (service: EmergencyService) => {
    const query = encodeURIComponent(`${service.name} ${service.address}`);
    const url = `https://www.google.com/search?q=${query}`;
    window.open(url, '_blank');
  };

  const handleServiceClick = (service: EmergencyService) => {
    setSelectedService(service);
  };

  const handleLocationSharingChange = (type: LocationSharingType) => {
    setLocationSharing(type);
    setShowLocationModal(false);
  };

  const handleSendSOS = () => {
    // Get current location (using map center as fallback)
    const currentLocation = mapRef?.getCenter() || { lat: kelownaPosition[0], lng: kelownaPosition[1] };
    const locationUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
    
    // Close friends list (mock data - in real app this would come from user's close friends)
    const closeFriends = ['Steve', 'John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Tom', 'Anna'];
    
    // Create SOS message
    const sosMessage = {
      type: 'sos',
      sender: 'You',
      message: `🚨 SOS Alert: I need help! My location: ${locationUrl}`,
      location: { lat: currentLocation.lat, lng: currentLocation.lng },
      timestamp: new Date().toISOString(),
      recipients: closeFriends
    };
    
    // Get existing messages from localStorage
    const existingMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
    
    // Add SOS message to each close friend's conversation
    closeFriends.forEach(friendName => {
      // Find or create conversation with this friend
      let conversation = existingMessages.find((msg: any) => msg.name === friendName);
      
      if (!conversation) {
        conversation = {
          id: existingMessages.length + 1,
          name: friendName,
          messages: []
        };
        existingMessages.push(conversation);
      }
      
      // Add SOS message
      conversation.messages.push({
        ...sosMessage,
        id: conversation.messages.length + 1,
        time: 'now'
      });
      
      // Update last message and time
      conversation.lastMessage = sosMessage.message;
      conversation.time = 'now';
      conversation.unread = true;
    });
    
    // Save to localStorage
    localStorage.setItem('dmMessages', JSON.stringify(existingMessages));
    
    // Also store sent SOS for preview on DM page
    const sentSOS = JSON.parse(localStorage.getItem('sentSOS') || '[]');
    sentSOS.push({
      ...sosMessage,
      sentAt: new Date().toISOString()
    });
    localStorage.setItem('sentSOS', JSON.stringify(sentSOS));
    
    // Close location modal
    setShowLocationModal(false);
    
    // Show Instagram-style confirmation popup
    setSosRecipientsCount(closeFriends.length);
    setShowSOSConfirmation(true);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowSOSConfirmation(false);
    }, 3000);
  };

  const getLocationButtonText = () => {
    if (locationSharing === 'none') {
      return 'Not sharing location';
    }
    return 'Sharing location';
  };

  const getLocationButtonIcon = () => {
    if (locationSharing === 'none') {
      return <FiMapPin size={16} style={{ transform: 'rotate(45deg)' }} />;
    }
    return <FiMapPin size={16} />;
  };

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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: locationSharing === 'none' ? '#262626' : '#0095f6',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = locationSharing === 'none' ? '#363636' : '#0084d4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = locationSharing === 'none' ? '#262626' : '#0095f6';
            }}
          >
            {getLocationButtonIcon()}
            {getLocationButtonText()}
          </button>
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
        key={`map-${mapMode}-${selectedFilters.size}`}
        center={kelownaPosition}
        zoom={12}
        style={{ 
          height: 'calc(100% - 72px)', 
          width: '100%', 
          marginTop: '72px',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: '#1a1a1a'
        }}
      >
        <MapRefSetter onMapReady={(map) => setMapRef(map)} />
        {selectedService && (
          <MapController center={selectedService.position} zoom={15} />
        )}
        {selectedShelter && (
          <MapController center={selectedShelter.position} zoom={15} />
        )}
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

        {/* Shelter Markers - Only show in SOS mode when Shelters filter is selected */}
        {mapMode === 'sos' && selectedFilters.has('Shelters') && filteredShelters.map((shelter) => (
          <Marker 
            key={shelter.id} 
            position={shelter.position}
            icon={createShelterIcon()}
          >
            <Popup>
              <div>
                <strong>{shelter.operator}</strong>
                <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                  {shelter.type}
                </p>
                <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                  {shelter.address}
                </p>
                <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                  {shelter.beds} beds available
                </p>
                <button
                  onClick={() => {
                    setSelectedShelter(shelter);
                    if (mapRef) {
                      mapRef.setView(shelter.position, 15);
                    }
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  View Details & Reserve
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergency Service Markers - Only show in SOS mode when filters are selected */}
        {mapMode === 'sos' && selectedFilters.size > 0 && filteredServices.map((service) => (
          <Marker 
            key={service.id} 
            position={service.position}
            icon={createSOSIcon(service.type)}
            eventHandlers={{
              click: () => handleServiceClick(service)
            }}
          >
            <Popup>
              <div>
                <strong>{service.name}</strong>
                <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                  {service.type}
                </p>
                <p style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '4px' }}>
                  {service.address}
                </p>
                <button
                  onClick={() => handleServiceClick(service)}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
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
          zIndex: 100,
          backgroundColor: 'rgba(255, 48, 64, 0.15)',
          padding: '16px',
          borderRadius: '16px',
          color: '#fff',
          maxWidth: '350px',
          maxHeight: '60vh',
          overflowY: 'auto',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 48, 64, 0.3)',
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FiAlertCircle size={20} color="#ff3040" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Emergency Services</h3>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#ffb3b8', fontSize: '12px', fontWeight: '600' }}>
              Filter by Type:
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              flexWrap: 'wrap',
              marginBottom: '8px'
            }}>
              {allCategories.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: selectedFilters.has(type) 
                      ? 'rgba(255, 48, 64, 0.5)' 
                      : 'rgba(255, 48, 64, 0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: selectedFilters.has(type)
                      ? '1px solid rgba(255, 48, 64, 0.8)'
                      : '1px solid rgba(255, 48, 64, 0.3)',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedFilters.has(type)) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 48, 64, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedFilters.has(type)) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 48, 64, 0.2)';
                    }
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            {selectedFilters.size > 0 && (
              <button
                onClick={() => setSelectedFilters(new Set())}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <p style={{ margin: '0 0 12px 0', color: '#ffb3b8', fontSize: '12px', lineHeight: '1.4' }}>
            Showing {filteredServices.length} services, {filteredShelters.length} shelters
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px'
          }}>
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                onClick={() => handleServiceClick(service)}
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(255, 48, 64, 0.2)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 48, 64, 0.3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 48, 64, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 48, 64, 0.2)';
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  {service.name}
                </div>
                <div style={{ fontSize: '11px', color: '#ffb3b8', marginBottom: '4px' }}>
                  {service.type}
                </div>
                <div style={{ fontSize: '10px', color: '#8e8e8e' }}>
                  {service.address}
                </div>
              </div>
            ))}
            {filteredShelters.map((shelter) => (
              <div 
                key={shelter.id}
                onClick={() => setSelectedShelter(shelter)}
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  {shelter.operator}
                </div>
                <div style={{ fontSize: '11px', color: '#86efac', marginBottom: '4px' }}>
                  {shelter.type}
                </div>
                <div style={{ fontSize: '10px', color: '#8e8e8e', marginBottom: '4px' }}>
                  {shelter.address}
                </div>
                <div style={{ fontSize: '10px', color: '#8e8e8e' }}>
                  {shelter.beds} beds
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shelter Info Modal */}
      {selectedShelter && (
        <div
          onClick={() => setSelectedShelter(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                {selectedShelter.operator}
              </h2>
              <button
                onClick={() => setSelectedShelter(null)}
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
            
            <div style={{ color: '#8e8e8e', fontSize: '14px', marginBottom: '12px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#22c55e' }}>OPERATOR:</strong> {selectedShelter.operator}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#22c55e' }}>ADDRESS:</strong> {selectedShelter.address}
              </div>
              {selectedShelter.website && (
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#22c55e' }}>WEBSITE:</strong>{' '}
                  <a 
                    href={selectedShelter.website.startsWith('http') ? selectedShelter.website : `https://${selectedShelter.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0095f6', textDecoration: 'underline' }}
                  >
                    {selectedShelter.website}
                  </a>
                </div>
              )}
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#22c55e' }}>NUMBER OF BEDS:</strong> {selectedShelter.beds}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#22c55e' }}>TYPE:</strong> {selectedShelter.type}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => handleGetDirectionsShelter(selectedShelter)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                <FiExternalLink size={16} />
                Get Directions
              </button>
              <button
                onClick={() => handleReserveSpots(selectedShelter)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                Reserve Spots
              </button>
            </div>

            {selectedShelter.phone && (
              <a
                href={`tel:${selectedShelter.phone.replace(/[^0-9]/g, '')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                <FiPhone size={16} />
                {selectedShelter.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Emergency Service Info Modal */}
      {selectedService && (
        <div
          onClick={() => setSelectedService(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                {selectedService.name}
              </h2>
              <button
                onClick={() => setSelectedService(null)}
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

            <div style={{ color: '#8e8e8e', fontSize: '14px', marginBottom: '12px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#22c55e' }}>TYPE:</strong> {selectedService.type}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#22c55e' }}>ADDRESS:</strong> {selectedService.address}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleGetDirectionsService(selectedService)}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                <FiExternalLink size={16} />
                Get Directions
              </button>
              <button
                onClick={() => handleViewOnGoogle(selectedService)}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                <FiExternalLink size={16} />
                View on Google
              </button>
            </div>

            {selectedService.phone && (
              <a
                href={`tel:${selectedService.phone.replace(/[^0-9]/g, '')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }}
              >
                <FiPhone size={16} />
                {selectedService.phone}
              </a>
            )}
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

      {/* Location Sharing Modal */}
      {showLocationModal && (
        <div
          onClick={() => setShowLocationModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '20px 20px 0 0',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
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
                Who can see your location
              </h2>
              <button
                onClick={() => setShowLocationModal(false)}
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
                <BsThreeDots size={20} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>

            <p style={{
              margin: '0 0 24px 0',
              color: '#8e8e8e',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              If you share, your precise location updates every time you open Instagram. It disappears if you don't open the app for 24 hours. <a href="#" style={{ color: '#0095f6', textDecoration: 'none' }}>Learn more</a>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Public Option */}
              <div
                onClick={() => handleLocationSharingChange('public')}
                style={{
                  padding: '16px',
                  backgroundColor: locationSharing === 'public' ? '#262626' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #262626',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (locationSharing !== 'public') {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (locationSharing !== 'public') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#0095f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiUsers size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff', marginBottom: '4px' }}>
                      Friends
                    </div>
                    <div style={{ fontSize: '14px', color: '#8e8e8e' }}>
                      422 followers you follow back
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: locationSharing === 'public' ? '6px solid #fff' : '2px solid #8e8e8e',
                  backgroundColor: locationSharing === 'public' ? '#fff' : 'transparent'
                }} />
              </div>

              {/* Close Friends Option */}
              <div
                onClick={() => handleLocationSharingChange('close-friends')}
                style={{
                  padding: '16px',
                  backgroundColor: locationSharing === 'close-friends' ? '#262626' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #262626',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (locationSharing !== 'close-friends') {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (locationSharing !== 'close-friends') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiUserCheck size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff', marginBottom: '4px' }}>
                      Close Friends
                    </div>
                    <div style={{ fontSize: '14px', color: '#8e8e8e' }}>
                      10 people &gt;
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: locationSharing === 'close-friends' ? '6px solid #fff' : '2px solid #8e8e8e',
                  backgroundColor: locationSharing === 'close-friends' ? '#fff' : 'transparent'
                }} />
              </div>

              {/* Individuals Option */}
              <div
                onClick={() => handleLocationSharingChange('individuals')}
                style={{
                  padding: '16px',
                  backgroundColor: locationSharing === 'individuals' ? '#262626' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #262626',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (locationSharing !== 'individuals') {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (locationSharing !== 'individuals') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#8e8e8e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiUser size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff', marginBottom: '4px' }}>
                      Only these friends
                    </div>
                    <div style={{ fontSize: '14px', color: '#8e8e8e' }}>
                      Choose people &gt;
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: locationSharing === 'individuals' ? '6px solid #fff' : '2px solid #8e8e8e',
                  backgroundColor: locationSharing === 'individuals' ? '#fff' : 'transparent'
                }} />
              </div>

              {/* No One Option */}
              <div
                onClick={() => handleLocationSharingChange('none')}
                style={{
                  padding: '16px',
                  backgroundColor: locationSharing === 'none' ? '#262626' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #262626',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (locationSharing !== 'none') {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (locationSharing !== 'none') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#8e8e8e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <FiMapPin size={20} color="#fff" />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(45deg)',
                      width: '2px',
                      height: '24px',
                      backgroundColor: '#fff'
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff', marginBottom: '4px' }}>
                      No one
                    </div>
                    <div style={{ fontSize: '14px', color: '#8e8e8e' }}>
                      Don't share location
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: locationSharing === 'none' ? '6px solid #fff' : '2px solid #8e8e8e',
                  backgroundColor: locationSharing === 'none' ? '#fff' : 'transparent'
                }} />
              </div>
            </div>

            {/* SOS Button */}
            <button
              onClick={handleSendSOS}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                backgroundColor: '#ed4956',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#ed4956';
              }}
            >
              <FiAlertCircle size={20} />
              Send SOS to Close Friends
            </button>

            <button
              onClick={() => setShowLocationModal(false)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#0095f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#0084d4';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#0095f6';
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* SOS Confirmation Popup */}
      {showSOSConfirmation && (
        <div
          onClick={() => setShowSOSConfirmation(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 3000,
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
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid #262626',
              cursor: 'default',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(237, 73, 86, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <FiAlertCircle size={32} color="#ed4956" />
              </div>
              
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#fff'
              }}>
                SOS Sent
              </h2>
              
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#8e8e8e',
                lineHeight: '1.5'
              }}>
                Your SOS alert has been sent to <strong style={{ color: '#fff' }}>{sosRecipientsCount} close friends</strong> with your current location.
              </p>
              
              <button
                onClick={() => {
                  setShowSOSConfirmation(false);
                  navigate('/dm');
                }}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#0095f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#0084d4';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = '#0095f6';
                }}
              >
                View Messages
              </button>
              
              <button
                onClick={() => setShowSOSConfirmation(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#8e8e8e',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.color = '#8e8e8e';
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelownaMapPage;

