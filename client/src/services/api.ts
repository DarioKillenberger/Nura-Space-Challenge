import { api } from "./axios";

export const apiService = {
  async getCurrentCity() {
    const response = await api.get("/user-city");
    return response.data;
  },

  async setCurrentCity(cityData: { cityName: string; latitude: number; longitude: number }) {
    const response = await api.post("/user-city", cityData);
    return response.data;
  },

  async getCitiesAutocomplete(query: string) {
    const response = await api.get("/weather/cities-autocomplete", {
      params: { query },
    });
    return response.data;
  },

  async getWeather() {
    const response = await api.get("/weather");
    return response.data;
  },
};
