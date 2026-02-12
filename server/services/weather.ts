import usersStore from "../store/users";
import { UserCity } from "../types";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

// ========== SERVICES (Business Logic) ==========

/**
 * Search cities using Open-Meteo Geocoding API
 */
async function searchCities(
  query: string,
  count: number = 10,
): Promise<UserCity[]> {
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

// TODO: Probably better to read from user profile directly, using the userID the request was made with. But we'll use the latitude and longitude from the request for now.
async function fetchWeatherData(userId: string) {
  const userCity = usersStore.getUserCity(userId);

  if (!userCity) {
    return [];
  }

  // console.log(userCity);
  const { latitude, longitude } = userCity;

  try {
    const url = `${WEATHER_API_URL}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,apparent_temperature,rain,wind_gusts_10m,relative_humidity_2m`;

    const response = await fetch(url);
    const data: any = await response.json();
    console.log("fetchWeatherData response:", data);
    if (!data) return [];

    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    return [];
  }
}

export default {
  searchCities,
  fetchWeatherData,
};
