import usersStore from "../store/users";
import { UserCity } from "../types";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

// ========== SERVICES (Business Logic) ==========

/**
 * Search cities using Open-Meteo Geocoding API
 */
async function searchCities(query: string, count: number = 10): Promise<UserCity[]> {
  try {
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=${encodeURIComponent(count)}&language=en&format=json`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (!data.results) return [];

    // Map to UserCity format
    return data.results.map((result: any) => ({
      cityName: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  } catch (error) {
    console.error("Geocoding API error:", error);
    return [];
  }
}

function fetchWeatherData(userId: string) {
  const cityData = usersStore.getUserCity(userId);
  return {
    city: cityData?.cityName || "Unknown",
    temperature: 15,
    condition: "Cloudy",
  };
}

export default {
  searchCities,
  fetchWeatherData,
};
