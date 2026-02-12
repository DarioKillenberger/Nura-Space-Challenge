import express from "express";
import alertsController from "../controllers/alerts";

const alertsRouter = express.Router();

alertsRouter.post("/", alertsController.sendAlert);

export { alertsRouter };
