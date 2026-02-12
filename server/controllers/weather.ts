import { Request, Response } from "express";
import weatherService from "../services/weather";
import usersStore from "../store/users";
import { UserCity } from "../types";

// ========== CONTROLLERS (Route Handlers) ==========

/**
 * GET /api/weather/cities-autocomplete?query=xxx
 * Search cities for autocomplete
 */
const getCitiesAutocomplete = async (req: Request, res: Response) => {
  const { query, count = 10 } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const cities = await weatherService.searchCities(query);
  res.json(cities);
};

/**
 * GET /api/weather
 * Get weather for user's saved city
 */
const getCurrentWeather = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const weather = await weatherService.fetchWeatherData(userId);
  console.log("getCurrentWeather response:", weather);
  res.json(weather);
};

/**
 * GET /api/user-city
 * Get user's current city
 */
const getCurrentCity = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const city = usersStore.getUserCity(userId) as UserCity | null;

  if (!city) {
    return res.status(404).json({ error: "No city set for user" });
  }

  res.json({
    cityName: city.cityName,
    latitude: city.latitude,
    longitude: city.longitude,
  });
};

/**
 * POST /api/user-city
 * Set user's current city
 */
const setCurrentCity = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { cityName, latitude, longitude } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!cityName) {
    return res.status(400).json({ error: "City is required" });
  }

  usersStore.setUserCity(userId, { cityName, latitude, longitude });

  res.json({ success: true, cityName });
};

export default {
  getCitiesAutocomplete,
  getCurrentWeather,
  getCurrentCity,
  setCurrentCity,
};
