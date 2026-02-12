import express from "express";
import weatherController from "../controllers/weather";

const weatherRouter = express.Router();
const userCityRouter = express.Router();

// Weather routes (mounted at /api/weather)
weatherRouter.get(
  "/cities-autocomplete",
  weatherController.getCitiesAutocomplete,
);
weatherRouter.get("/", weatherController.getCurrentWeather);

// User city routes (mounted at /api/user-city)
userCityRouter.get("/", weatherController.getCurrentCity);
userCityRouter.post("/", weatherController.setCurrentCity);

export { weatherRouter, userCityRouter };
