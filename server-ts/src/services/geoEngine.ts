export interface IndianLocation {
  state: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

export const INDIAN_LOCATIONS_DATABASE: IndianLocation[] = [
  // Andhra Pradesh
  { state: 'Andhra Pradesh', district: 'Visakhapatnam', city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { state: 'Andhra Pradesh', district: 'Vijayawada', city: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { state: 'Andhra Pradesh', district: 'Tirupati', city: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  { state: 'Andhra Pradesh', district: 'Kakinada', city: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  
  // Telangana
  { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { state: 'Telangana', district: 'Warangal', city: 'Warangal', lat: 17.9689, lng: 79.5941 },
  { state: 'Telangana', district: 'Karimnagar', city: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
  { state: 'Telangana', district: 'Nizamabad', city: 'Nizamabad', lat: 18.6725, lng: 78.0941 },

  // Tamil Nadu
  { state: 'Tamil Nadu', district: 'Chennai', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Tamil Nadu', district: 'Coimbatore', city: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { state: 'Tamil Nadu', district: 'Madurai', city: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { state: 'Tamil Nadu', district: 'Cuddalore', city: 'Cuddalore', lat: 11.7480, lng: 79.7714 },

  // Maharashtra
  { state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { state: 'Maharashtra', district: 'Pune', city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { state: 'Maharashtra', district: 'Nagpur', city: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { state: 'Maharashtra', district: 'Ratnagiri', city: 'Ratnagiri', lat: 16.9902, lng: 73.3120 },

  // Odisha
  { state: 'Odisha', district: 'Khurda', city: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { state: 'Odisha', district: 'Cuttack', city: 'Cuttack', lat: 20.4625, lng: 85.8828 },
  { state: 'Odisha', district: 'Puri', city: 'Puri', lat: 19.8135, lng: 85.8312 },
  { state: 'Odisha', district: 'Balasore', city: 'Balasore', lat: 21.4942, lng: 86.9317 },

  // Kerala
  { state: 'Kerala', district: 'Thiruvananthapuram', city: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { state: 'Kerala', district: 'Ernakulam', city: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { state: 'Kerala', district: 'Kozhikode', city: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  { state: 'Kerala', district: 'Wayanad', city: 'Kalpetta', lat: 11.6103, lng: 76.0828 },

  // West Bengal
  { state: 'West Bengal', district: 'Kolkata', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { state: 'West Bengal', district: 'Darjeeling', city: 'Darjeeling', lat: 27.0410, lng: 88.2663 },
  { state: 'West Bengal', district: 'South 24 Parganas', city: 'Canning', lat: 22.3149, lng: 88.6588 },

  // Gujarat
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Gujarat', district: 'Surat', city: 'Surat', lat: 21.1702, lng: 72.8311 },
  { state: 'Gujarat', district: 'Kutch', city: 'Bhuj', lat: 23.2420, lng: 69.6669 },

  // Rajasthan
  { state: 'Rajasthan', district: 'Jaipur', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Rajasthan', district: 'Jodhpur', city: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { state: 'Rajasthan', district: 'Churu', city: 'Churu', lat: 28.2900, lng: 74.9700 },

  // Delhi
  { state: 'Delhi', district: 'New Delhi', city: 'New Delhi', lat: 28.6139, lng: 77.2090 },

  // Assam
  { state: 'Assam', district: 'Kamrup Metropolitan', city: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { state: 'Assam', district: 'Cachar', city: 'Silchar', lat: 24.8333, lng: 92.7789 },

  // Jammu & Kashmir
  { state: 'Jammu & Kashmir', district: 'Srinagar', city: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { state: 'Jammu & Kashmir', district: 'Jammu', city: 'Jammu', lat: 32.7266, lng: 74.8570 }
];

export class GeoEngineService {
  /**
   * Resolves location coordinates and metadata from text or user input.
   */
  public static resolveLocation(locationQuery?: string, inputLat?: number, inputLng?: number) {
    if (inputLat && inputLng) {
      // Nearest matching city
      let nearest = INDIAN_LOCATIONS_DATABASE[0];
      let minDistance = Number.MAX_VALUE;

      INDIAN_LOCATIONS_DATABASE.forEach((loc) => {
        const d = Math.hypot(loc.lat - inputLat, loc.lng - inputLng);
        if (d < minDistance) {
          minDistance = d;
          nearest = loc;
        }
      });

      return {
        state: nearest.state,
        district: nearest.district,
        city: nearest.city,
        latitude: inputLat,
        longitude: inputLng,
        location_confidence: minDistance < 0.2 ? 0.95 : 0.75,
      };
    }

    if (locationQuery) {
      const q = locationQuery.toLowerCase();
      const match = INDIAN_LOCATIONS_DATABASE.find(
        (loc) =>
          loc.city.toLowerCase().includes(q) ||
          loc.district.toLowerCase().includes(q) ||
          loc.state.toLowerCase().includes(q)
      );

      if (match) {
        return {
          state: match.state,
          district: match.district,
          city: match.city,
          latitude: match.lat,
          longitude: match.lng,
          location_confidence: 0.85,
        };
      }
    }

    // Default fallback to New Delhi
    return {
      state: 'Delhi',
      district: 'New Delhi',
      city: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      location_confidence: 0.50,
    };
  }
}
