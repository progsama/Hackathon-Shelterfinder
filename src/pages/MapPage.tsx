import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import MapController from '../components/MapController';
import MapRefSetter from '../components/MapRefSetter';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiHeart, FiAlertCircle, FiPhone, FiExternalLink, FiShoppingBag, FiShare2, FiUsers, FiUser, FiGlobe, FiX, FiAlertTriangle, FiChevronLeft } from 'react-icons/fi';
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

// Create custom icon for business support locations
const createBusinessIcon = (): L.DivIcon => {
  return L.divIcon({
    className: 'business-marker',
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
          <circle cx="14" cy="14" r="12" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
          <path d="M14 8 L14 20 M8 14 L20 14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
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

interface Business {
  id: number;
  name: string;
  description: string;
  address: string;
  position: [number, number];
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [mapMode, setMapMode] = useState<'map' | 'sos'>('map');
  const [sosTab, setSosTab] = useState<'emergency' | 'aid'>('emergency');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(false);
  const [sharingMode, setSharingMode] = useState<'public' | 'close-friends' | 'individuals' | 'disabled'>('disabled');
  const [showSharingOptions, setShowSharingOptions] = useState<boolean>(false);
  const [showSOSConfirmation, setShowSOSConfirmation] = useState<boolean>(false);
  const kelownaPosition: [number, number] = [49.8880, -119.4960];
  
  const closeFriends = ['Monkey D. Luffy', 'Son Goku', 'Naruto Uzumaki', 'Roronoa Zoro', 'Satoru Gojo'];
  
  
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
    { 
      id: 4, 
      title: 'Sunset View', 
      position: [49.8500, -119.6000], 
      date: '2024-06-25',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
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

  // Business support locations from PDF
  const businesses: Business[] = [
    {
      id: 1,
      name: 'Born to Shake',
      description: 'Ice for coolers, use of their kitchen, drinking water, coffee, transport help with their van.',
      address: '889 Vaughan Ave #110, Kelowna, BC V1Y 0H8',
      position: [49.8850, -119.4900]
    },
    {
      id: 2,
      name: 'Pretty Not Bad',
      description: 'Lunch for evacuees.',
      address: '1-740 Clement Ave, Kelowna, BC',
      position: [49.8900, -119.4950]
    },
    {
      id: 3,
      name: 'Cobs Bread West K',
      description: 'Food for evacuees.',
      address: 'Unit #107, 2231 Louie Dr, West Bank, BC V4T 3K3',
      position: [49.8500, -119.6000]
    },
    {
      id: 4,
      name: 'Bright Jenny',
      description: 'Free drip coffee and place to sort out life (free wifi etc).',
      address: '1977 Kirschner Rd, Kelowna, BC V1Y 4N7',
      position: [49.8950, -119.4850]
    },
    {
      id: 5,
      name: 'Panevino Pizza',
      description: 'Free meals for evacuees.',
      address: '3996 Irvine Rd, Oyama, BC V4V 2G4',
      position: [50.0500, -119.3700]
    },
    {
      id: 6,
      name: 'Orchard Park Plaza',
      description: 'Free trailer and RV parking.',
      address: '740 Hollywood Rd S, Kelowna, BC',
      position: [49.8800, -119.4700]
    }
  ];

  const handleGetDirectionsBusiness = (business: Business) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${business.position[0]},${business.position[1]}`;
    window.open(url, '_blank');
  };

  const handleSendSOS = () => {
    let userLocation: [number, number] = kelownaPosition;
    let locationText = 'Kelowna, BC';
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = [position.coords.latitude, position.coords.longitude];
          locationText = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          sendSOSToCloseFriends(userLocation, locationText);
        },
        () => {
          sendSOSToCloseFriends(userLocation, locationText);
        }
      );
    } else {
      sendSOSToCloseFriends(userLocation, locationText);
    }
  };

  const sendSOSToCloseFriends = (location: [number, number], locationText: string) => {
    const sosTimestamp = Date.now();
    const sosMessages = closeFriends.map((friend, index) => ({
      id: sosTimestamp + index,
      name: friend,
      lastMessage: `🚨 SOS Alert: I need help! My location: ${locationText}`,
      time: 'now',
      unread: true,
      isSOS: true,
      location: location,
      timestamp: new Date().toISOString(),
      locationText: locationText,
      sosSentAt: sosTimestamp
    }));

    const existingMessages = JSON.parse(localStorage.getItem('dmMessages') || '[]');
    const nonSOSMessages = existingMessages.filter((m: any) => !m.isSOS);
    const updatedMessages = [...sosMessages, ...nonSOSMessages];
    localStorage.setItem('dmMessages', JSON.stringify(updatedMessages));
    localStorage.setItem('lastSOSTimestamp', sosTimestamp.toString());
    localStorage.setItem('sosSentAfterLoad', 'true');
    
    setShowSharingOptions(false);
    
    setTimeout(() => {
      const event = new CustomEvent('sosSent');
      window.dispatchEvent(event);
    }, 50);
    
    setShowSOSConfirmation(true);
    setTimeout(() => {
      setShowSOSConfirmation(false);
    }, 3000);
  };

  useEffect(() => {
    if (mapRef) {
      setTimeout(() => {
        mapRef.invalidateSize();
      }, 100);
    }
  }, [selectedFilters, mapRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdown = document.querySelector('[data-sharing-dropdown]');
      const button = document.querySelector('[data-sharing-button]');
      
      if (showSharingOptions && dropdown && button) {
        if (!dropdown.contains(target) && !button.contains(target)) {
          setShowSharingOptions(false);
        }
      }
    };

    if (showSharingOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSharingOptions]);

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
        .leaflet-top.leaflet-left {
          top: auto !important;
          bottom: 20px !important;
          right: 20px !important;
          left: auto !important;
        }
        .leaflet-control-zoom {
          margin: 0 !important;
          display: block !important;
          visibility: visible !important;
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

      {/* Back Button - Top Left of Map */}
      <Link
        to="/dm"
        style={{
          position: 'absolute',
          top: '90px',
          left: '20px',
          zIndex: 1000,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        }}
      >
        <FiChevronLeft size={24} />
      </Link>

      {/* Share Location Button - Top Middle of Map */}
      <div style={{
        position: 'absolute',
        top: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <button
            data-sharing-button
            onClick={() => setShowSharingOptions(!showSharingOptions)}
            style={{
              padding: '8px 16px',
              backgroundColor: isSharingLocation ? '#22c55e' : 'rgba(0, 0, 0, 0.85)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isSharingLocation) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isSharingLocation) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
              }
            }}
          >
            <FiShare2 size={16} />
            {isSharingLocation ? 'Sharing Location' : 'Share Location'}
          </button>
          
          {showSharingOptions && (
            <div
              data-sharing-dropdown
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '220px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
                border: '1px solid #333',
                zIndex: 2000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #333', marginBottom: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                  Share Location With
                </div>
                <div style={{ fontSize: '11px', color: '#8e8e8e' }}>
                  {isSharingLocation ? `Currently sharing with: ${sharingMode === 'public' ? 'Public' : sharingMode === 'close-friends' ? 'Close Friends' : 'Individuals'}` : 'Location sharing is disabled'}
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSharingMode('public');
                  setIsSharingLocation(true);
                  setShowSharingOptions(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: sharingMode === 'public' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (sharingMode !== 'public') {
                    e.currentTarget.style.backgroundColor = '#262626';
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (sharingMode !== 'public') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <FiGlobe size={18} color={sharingMode === 'public' ? '#22c55e' : '#8e8e8e'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: sharingMode === 'public' ? '600' : '400' }}>Public</div>
                  <div style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '2px' }}>Everyone can see your location</div>
                </div>
                {sharingMode === 'public' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />}
              </button>
              
              <button
                onClick={() => {
                  setSharingMode('close-friends');
                  setIsSharingLocation(true);
                  setShowSharingOptions(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: sharingMode === 'close-friends' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (sharingMode !== 'close-friends') {
                    e.currentTarget.style.backgroundColor = '#262626';
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (sharingMode !== 'close-friends') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <FiUsers size={18} color={sharingMode === 'close-friends' ? '#22c55e' : '#8e8e8e'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: sharingMode === 'close-friends' ? '600' : '400' }}>Close Friends</div>
                  <div style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '2px' }}>Only your close friends list</div>
                </div>
                {sharingMode === 'close-friends' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />}
              </button>
              
              <button
                onClick={() => {
                  setSharingMode('individuals');
                  setIsSharingLocation(true);
                  setShowSharingOptions(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: sharingMode === 'individuals' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (sharingMode !== 'individuals') {
                    e.currentTarget.style.backgroundColor = '#262626';
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (sharingMode !== 'individuals') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <FiUser size={18} color={sharingMode === 'individuals' ? '#22c55e' : '#8e8e8e'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: sharingMode === 'individuals' ? '600' : '400' }}>Individuals</div>
                  <div style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '2px' }}>Select specific people</div>
                </div>
                {sharingMode === 'individuals' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />}
              </button>
              
              <div style={{ borderTop: '1px solid #333', marginTop: '4px', paddingTop: '4px', marginBottom: '4px' }}>
                <button
                  onClick={handleSendSOS}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 48, 64, 0.2)',
                    color: '#fff',
                    border: '1px solid rgba(255, 48, 64, 0.5)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 48, 64, 0.3)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 48, 64, 0.2)';
                  }}
                >
                  <FiAlertTriangle size={18} color="#ff3040" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#ff3040' }}>Send SOS</div>
                    <div style={{ fontSize: '11px', color: '#ffb3b8', marginTop: '2px' }}>Send emergency alert to close friends</div>
                  </div>
                </button>
              </div>
              
              <div style={{ borderTop: '1px solid #333', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  onClick={() => {
                    setSharingMode('disabled');
                    setIsSharingLocation(false);
                    setShowSharingOptions(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isSharingLocation ? 'rgba(255, 48, 64, 0.2)' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (!isSharingLocation) {
                      e.currentTarget.style.backgroundColor = '#262626';
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (!isSharingLocation) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <FiX size={18} color={isSharingLocation ? '#ff3040' : '#8e8e8e'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isSharingLocation ? '600' : '400' }}>Disable Location</div>
                    <div style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '2px' }}>Stop sharing your location</div>
                  </div>
                  {isSharingLocation && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff3040' }} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        key={`map-${mapMode}-${selectedFilters.size}`}
        center={kelownaPosition}
        zoom={12}
        zoomControl={true}
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
            {/* Orange zone - Wildfire information area (rendered first, so it's below) */}
            <Polygon
              positions={alertFireZone}
              pathOptions={{
                color: '#ff9500',
                fillColor: '#ff9500',
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>Wildfire Information Zone</strong>
                  <p>Area with active wildfire information</p>
                </div>
              </Popup>
            </Polygon>
            
            {/* Red zones - More affected areas (rendered after, so they're on top) */}
            <Polygon
              positions={orderFireZone1}
              pathOptions={{
                color: '#ff3040',
                fillColor: '#ff3040',
                fillOpacity: 0.35,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>High Risk Zone 1</strong>
                  <p>More affected area - immediate evacuation required</p>
                </div>
              </Popup>
            </Polygon>
            
            <Polygon
              positions={orderFireZone2}
              pathOptions={{
                color: '#ff3040',
                fillColor: '#ff3040',
                fillOpacity: 0.35,
                weight: 2
              }}
            >
              <Popup>
                <div>
                  <strong>High Risk Zone 2</strong>
                  <p>More affected area - immediate evacuation required</p>
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


        {/* Emergency Service Markers - Only show in SOS mode when Emergency Services tab is active and filters are selected */}
        {mapMode === 'sos' && sosTab === 'emergency' && selectedFilters.size > 0 && filteredServices.map((service) => (
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

        {/* Shelter Markers - Only show in SOS mode when Emergency Services tab is active and Shelters filter is selected */}
        {mapMode === 'sos' && sosTab === 'emergency' && selectedFilters.has('Shelters') && filteredShelters.map((shelter) => (
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

        {/* Business Support Markers - Only show in SOS mode when Aid tab is active */}
        {mapMode === 'sos' && sosTab === 'aid' && businesses.map((business) => (
          <Marker 
            key={business.id} 
            position={business.position}
            icon={createBusinessIcon()}
            eventHandlers={{
              click: () => setSelectedBusiness(business)
            }}
          />
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


      {mapMode === 'sos' && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          left: '20px',
          zIndex: 100,
          backgroundColor: '#1a1a1a',
          padding: '0',
          borderRadius: '16px',
          color: '#fff',
          maxWidth: '350px',
          maxHeight: '60vh',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          border: '2px solid #333',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tab Buttons */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #333',
            backgroundColor: '#0f0f0f'
          }}>
            <button
              onClick={() => setSosTab('emergency')}
              style={{
                flex: 1,
                padding: '14px 16px',
                backgroundColor: sosTab === 'emergency' ? '#1a1a1a' : 'transparent',
                color: sosTab === 'emergency' ? '#fff' : '#999',
                border: 'none',
                borderBottom: sosTab === 'emergency' ? '3px solid #ff3040' : '3px solid transparent',
                fontSize: '15px',
                fontWeight: sosTab === 'emergency' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (sosTab !== 'emergency') {
                  e.currentTarget.style.backgroundColor = '#262626';
                  e.currentTarget.style.color = '#ccc';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (sosTab !== 'emergency') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#999';
                }
              }}
            >
              <FiAlertCircle size={18} />
              Emergency Services
            </button>
            <button
              onClick={() => setSosTab('aid')}
              style={{
                flex: 1,
                padding: '14px 16px',
                backgroundColor: sosTab === 'aid' ? '#1a1a1a' : 'transparent',
                color: sosTab === 'aid' ? '#fff' : '#999',
                border: 'none',
                borderBottom: sosTab === 'aid' ? '3px solid #3b82f6' : '3px solid transparent',
                fontSize: '15px',
                fontWeight: sosTab === 'aid' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (sosTab !== 'aid') {
                  e.currentTarget.style.backgroundColor = '#262626';
                  e.currentTarget.style.color = '#ccc';
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (sosTab !== 'aid') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#999';
                }
              }}
            >
              <FiShoppingBag size={18} />
              Aid
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {sosTab === 'emergency' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FiAlertCircle size={20} color="#ff3040" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#fff' }}>Emergency Services</h3>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#e0e0e0', fontSize: '12px', fontWeight: '600' }}>
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

                <p style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: '12px', lineHeight: '1.4' }}>
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
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#fff' }}>
                        {service.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#ffb3b8', marginBottom: '4px' }}>
                        {service.type}
                      </div>
                      <div style={{ fontSize: '10px', color: '#bbb' }}>
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
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#fff' }}>
                        {shelter.operator}
                      </div>
                      <div style={{ fontSize: '11px', color: '#86efac', marginBottom: '4px' }}>
                        {shelter.type}
                      </div>
                      <div style={{ fontSize: '10px', color: '#bbb', marginBottom: '4px' }}>
                        {shelter.address}
                      </div>
                      <div style={{ fontSize: '10px', color: '#bbb' }}>
                        {shelter.beds} beds
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {sosTab === 'aid' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FiShoppingBag size={20} color="#3b82f6" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#fff' }}>Aid</h3>
                </div>
                <p style={{ margin: '0 0 16px 0', color: '#e0e0e0', fontSize: '14px', lineHeight: '1.5' }}>
                  Find businesses around you that are providing services during the emergency.
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => setSelectedBusiness(business)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '10px',
                        border: '1px solid #3b82f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.backgroundColor = '#333';
                        e.currentTarget.style.borderColor = '#60a5fa';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.backgroundColor = '#2a2a2a';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#fff', 
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        {business.name}
                      </div>
                      <div style={{ 
                        color: '#bbb', 
                        fontSize: '12px',
                        lineHeight: '1.4'
                      }}>
                        {business.description}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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

      {/* Business Info Modal */}
      {selectedBusiness && (
        <div
          onClick={() => setSelectedBusiness(null)}
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
              border: '1px solid #333',
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
                {selectedBusiness.name}
              </h2>
              <button
                onClick={() => setSelectedBusiness(null)}
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
                  e.currentTarget.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ color: '#e0e0e0', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '4px' }}>DESCRIPTION:</strong>
                {selectedBusiness.description}
              </div>
              <div>
                <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '4px' }}>ADDRESS:</strong>
                {selectedBusiness.address}
              </div>
            </div>

            <button
              onClick={() => handleGetDirectionsBusiness(selectedBusiness)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3b82f6',
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
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              <FiExternalLink size={16} />
              Get Directions
            </button>
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

      {/* SOS Confirmation Popup */}
      {showSOSConfirmation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              border: '2px solid #ff3040',
              boxShadow: '0 8px 32px rgba(255, 48, 64, 0.3)',
              textAlign: 'center',
              pointerEvents: 'auto'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 48, 64, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FiAlertTriangle size={32} color="#ff3040" />
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '600', color: '#fff' }}>
              SOS Sent!
            </h2>
            <p style={{ margin: '0 0 8px 0', color: '#e0e0e0', fontSize: '16px', lineHeight: '1.5' }}>
              Your SOS alert has been sent to your close friends.
            </p>
            <p style={{ margin: '0', color: '#8e8e8e', fontSize: '14px', lineHeight: '1.5' }}>
              They will receive your location and can help you immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;

