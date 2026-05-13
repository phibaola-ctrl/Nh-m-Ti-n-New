import { GoogleGenAI, Type } from "@google/genai";
import { TravelItinerary } from "../types";

export async function generateItinerary(
  destination: string,
  duration: number,
  budget: string,
  travelStyle: string,
  interests: string[]
): Promise<TravelItinerary> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are a World-Class Travel Architect & Nomad AI.
    Create a highly personalized, "cinematic" travel itinerary in VIETNAMESE for:
    Destination: ${destination}
    Duration: ${duration} days
    Budget: ${budget}
    Style: ${travelStyle}
    Interests: ${interests.join(', ')}

    CORE REQUIREMENTS:
    1. Provide estimated Lat/Lng coordinates for EVERY location (activities, hotels, food spots).
    2. Optimize the travel order of activities within each day to minimize distance.
    3. Include "Hidden Gems" that are typical for digital nomads or modern adventurers.
    4. Descriptions must be vivid, premium, and evocative.
    5. ALL text MUST be in VIETNAMESE.
    6. For coordinates: give the most accurate estimated [latitude, longitude].
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["overview", "days", "hotels", "foodAndCafes", "transportation", "hiddenGems", "socialSpots"],
        properties: {
          overview: {
            type: Type.OBJECT,
            required: ["destination", "duration", "budget", "travelStyle", "weatherSuggestion"],
            properties: {
              destination: { type: Type.STRING },
              duration: { type: Type.STRING },
              budget: { type: Type.STRING },
              travelStyle: { type: Type.STRING },
              weatherSuggestion: { type: Type.STRING },
            }
          },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["day", "date", "activities"],
              properties: {
                day: { type: Type.INTEGER },
                date: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "description", "imagePrompt", "cost", "visitTime", "mapsKeyword", "duration", "tips", "type", "coordinates"],
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      imagePrompt: { type: Type.STRING },
                      cost: { type: Type.STRING },
                      visitTime: { type: Type.STRING },
                      mapsKeyword: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      tips: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["Morning", "Afternoon", "Evening", "Nightlife"] },
                      coordinates: {
                        type: Type.OBJECT,
                        required: ["lat", "lng"],
                        properties: {
                          lat: { type: Type.NUMBER },
                          lng: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          hotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["name", "description", "imagePrompt", "priceRange", "advantages", "coordinates"],
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                priceRange: { type: Type.STRING },
                advantages: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  required: ["lat", "lng"],
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                }
              }
            }
          },
          foodAndCafes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["name", "description", "imagePrompt", "signatureDishes", "coordinates"],
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                signatureDishes: { type: Type.ARRAY, items: { type: Type.STRING } },
                coordinates: {
                  type: Type.OBJECT,
                  required: ["lat", "lng"],
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                }
              }
            }
          },
          transportation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["title", "description", "imagePrompt", "travelTime", "suggestions"],
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                travelTime: { type: Type.STRING },
                suggestions: { type: Type.STRING },
              }
            }
          },
          hiddenGems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["name", "description", "imagePrompt", "coordinates"],
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  required: ["lat", "lng"],
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                }
              }
            }
          },
          socialSpots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["name", "description", "imagePrompt", "coordinates"],
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  required: ["lat", "lng"],
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const itinerary = JSON.parse(response.text) as TravelItinerary;

  // Function to get a high-quality placeholder image based on prompt
  const getImageUrl = (prompt: string, index: number) => {
    // Generate a consistent seed from the prompt
    const seed = encodeURIComponent(prompt.slice(0, 10)) + index;
    return `https://picsum.photos/seed/${seed}/1200/800`;
  };

  // Assign image URLs
  itinerary.days.forEach(day => {
    day.activities.forEach((activity, idx) => {
      activity.imageUrl = getImageUrl(activity.imagePrompt, idx);
    });
  });
  itinerary.hotels.forEach((hotel, idx) => hotel.imageUrl = getImageUrl(hotel.imagePrompt, idx + 10));
  itinerary.foodAndCafes.forEach((item, idx) => item.imageUrl = getImageUrl(item.imagePrompt, idx + 20));
  itinerary.transportation.forEach((item, idx) => item.imageUrl = getImageUrl(item.imagePrompt, idx + 30));
  itinerary.hiddenGems.forEach((item, idx) => item.imageUrl = getImageUrl(item.imagePrompt, idx + 40));
  itinerary.socialSpots.forEach((item, idx) => item.imageUrl = getImageUrl(item.imagePrompt, idx + 50));

  return itinerary;
}
