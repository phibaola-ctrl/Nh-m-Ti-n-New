import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { TravelItinerary, Activity } from '../../types';
import { MAP_FALLBACKS, getRoute, LatLng } from '../../services/mapServices';
import { Maximize2, Map as MapIcon, Moon, Sun } from 'lucide-react';

// Custom Marker Icon
const createGlowingIcon = () => L.divIcon({
  className: 'glowing-marker',
  html: '<div class="marker-inner"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const glowingIcon = createGlowingIcon();

interface MapControllerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapController = ({ center, zoom }: MapControllerProps) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom || 13, {
        animate: true,
        duration: 1
      });
    }
  }, [center, zoom, map]);
  return null;
};

interface TravelMapProps {
  itinerary: TravelItinerary;
  activeDay?: number;
  onLocationSelect?: (location: any) => void;
}

export default function TravelMap({ itinerary, activeDay = 1, onLocationSelect }: TravelMapProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [routes, setRoutes] = useState<[number, number][][]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);

  // Collect all locations for the active day
  useEffect(() => {
    const day = itinerary.days.find(d => d.day === activeDay);
    if (!day) return;

    const locations: any[] = [
      ...day.activities
    ];

    // Add selected hotel if it has coordinates
    itinerary.hotels.forEach(h => {
      if (h.coordinates) locations.push({ ...h, type: 'Hotel' });
    });

    setAllLocations(locations);

    // Fetch routes between activities
    const fetchRoutes = async () => {
      const dayActivities = day.activities.filter(a => a.coordinates);
      const newRoutes: [number, number][][] = [];

      for (let i = 0; i < dayActivities.length - 1; i++) {
        const start = dayActivities[i].coordinates!;
        const end = dayActivities[i + 1].coordinates!;
        const route = await getRoute(start, end);
        if (route) newRoutes.push(route);
      }
      setRoutes(newRoutes);
    };

    fetchRoutes();
  }, [itinerary, activeDay]);

  const defaultCenter = allLocations[0]?.coordinates || { lat: 0, lng: 0 };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-vibrant-black bg-vibrant-black/5 group">
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 bg-white border-2 border-vibrant-black rounded-xl shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          className="p-3 bg-white border-2 border-vibrant-black rounded-xl shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all md:flex hidden"
          onClick={() => {
            const el = document.querySelector('.leaflet-container');
            el?.requestFullscreen();
          }}
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url={darkMode ? MAP_FALLBACKS.DARK_MODE_LAYER.url : MAP_FALLBACKS.TILE_LAYERS[0].url}
          attribution={darkMode ? MAP_FALLBACKS.DARK_MODE_LAYER.attribution : MAP_FALLBACKS.TILE_LAYERS[0].attribution}
        />
        
        <ZoomControl position="bottomright" />
        <MapController center={allLocations[0]?.coordinates} />

        {/* Routes */}
        {routes.map((route, idx) => (
          <Polyline
            key={idx}
            positions={route}
            pathOptions={{
              color: darkMode ? '#FFD700' : '#FF6321',
              weight: 4,
              opacity: 0.8,
              className: 'route-polyline'
            }}
          />
        ))}

        {/* Markers */}
        {allLocations.map((loc, idx) => (
          loc.coordinates && (
            <Marker 
              key={`${loc.name}-${idx}`}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={glowingIcon}
              eventHandlers={{
                click: () => onLocationSelect?.(loc)
              }}
            >
              <Popup className="premium-popup">
                <div className="p-2 max-w-[200px]">
                  <img 
                    src={loc.imageUrl || `https://picsum.photos/seed/${loc.name}/200/120`} 
                    alt={loc.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-display text-sm uppercase leading-tight mb-1">{loc.name}</h3>
                  <p className="text-[10px] opacity-70 mb-2 line-clamp-2">{loc.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-vibrant-orange">{loc.type || 'Hoạt động'}</span>
                    <button 
                      className="text-[9px] font-bold uppercase underline"
                      onClick={() => onLocationSelect?.(loc)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Map Empty State */}
      {allLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-vibrant-cream/50 backdrop-blur-sm z-[2000]">
          <div className="text-center p-8 bg-white border-4 border-vibrant-black shadow-[8px_8px_0px_#1a1a1a] rounded-3xl max-w-sm">
            <MapIcon className="w-12 h-12 mx-auto mb-4 text-vibrant-orange animate-bounce" />
            <h3 className="text-2xl font-display uppercase italic mb-2">Đang Đồng Bộ Atlas...</h3>
            <p className="text-xs font-medium opacity-60 uppercase tracking-widest">Chuyển đổi tọa độ thành hành trình sử thi của bạn</p>
          </div>
        </div>
      )}
    </div>
  );
}
