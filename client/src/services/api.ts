import { api } from "./axios";
import type { CityOption } from "../types";

export const apiService = {
  async getCurrentCity() {
    const response = await api.get("/user-city");
    return response.data;
  },

  async setCurrentCity(cityData: CityOption) {
    const response = await api.post("/user-city", cityData);
    return response.data;
  },

  async getCitiesAutocomplete(query: string): Promise<CityOption[]> {
    const response = await api.get("/weather/cities-autocomplete", {
      params: { query },
    });
    return response.data;
  },

  async getWeather() {
    const response = await api.get("/weather");
    console.log("getWeather response:", response.data);
    return response.data;
  },
};
