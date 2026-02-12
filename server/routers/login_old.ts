import express from "express";
import loginController from "../controllers/login_old";

const router = new express.Router();

// new login
router.route("/login/:username/:password").get(loginController.newLogin);

// set a city
router.route("/city/:coordinates").set(weatherController.setCity);

// get weather for a city
router.route("/weather/:coordinates").get(weatherController.getWeather);

export default router;
