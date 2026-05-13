import axios from 'axios';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodeResponse {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Geocode a place name into coordinates using Nominatim API (OpenStreetMap)
 */
export async function geocode(query: string): Promise<LatLng | null> {
  try {
    const response = await axios.get<GeocodeResponse[]>(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'NomadMap-AI-Planner'
        }
      }
    );

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get a route between two points using OSRM (Open Source Routing Machine)
 */
export async function getRoute(start: LatLng, end: LatLng): Promise<[number, number][] | null> {
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const coordinates = response.data.routes[0].geometry.coordinates;
      // OSRM returns [lng, lat], we need [lat, lng] for Leaflet
      return coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) as [number, number][];
    }
    return null;
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

/**
 * Fallback to cached or local data if needed (simplistic implementation)
 */
export const MAP_FALLBACKS = {
  TILE_LAYERS: [
    {
      name: 'CartoDB Voyager',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    {
      name: 'OpenStreetMap Hot',
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
    }
  ],
  DARK_MODE_LAYER: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};
