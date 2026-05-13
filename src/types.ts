export interface Activity {
  name: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
  cost: string;
  visitTime: string;
  mapsKeyword: string;
  duration: string;
  tips: string;
  type: 'Morning' | 'Afternoon' | 'Evening' | 'Nightlife';
  coordinates?: { lat: number; lng: number };
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export interface Recommendation {
  name: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
  priceRange?: string;
  advantages?: string;
  signatureDishes?: string[];
  location?: string;
  coordinates?: { lat: number; lng: number };
}

export interface TravelItinerary {
  overview: {
    destination: string;
    duration: string;
    budget: string;
    travelStyle: string;
    weatherSuggestion: string;
  };
  days: DayPlan[];
  hotels: Recommendation[];
  foodAndCafes: Recommendation[];
  transportation: {
    title: string;
    description: string;
    imagePrompt: string;
    imageUrl?: string;
    travelTime: string;
    suggestions: string;
  }[];
  hiddenGems: Recommendation[];
  socialSpots: Recommendation[];
}
