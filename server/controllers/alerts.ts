import { Request, Response } from "express";
import websocketService from "../services/websocket";
import { ALERT_TYPES } from "../types";

// ========== CONTROLLERS (Route Handlers) ==========

/**
 * POST /api/alerts
 * Send an alert to all clients with in specified city
 * @param req.body.cityName - The name of the city (required)
 * @param req.body.alertSeverity - The severity of the alert (optional, defaults to "info") - options are strictly "info" | "warning" | "danger"
 * @param req.body.alertMessage - The message content of the alert (required)
 */
const sendAlert = (req: Request, res: Response) => {
  const { cityName, alertSeverity = "info", alertMessage } = req.body;

  if (!cityName) {
    return res.status(401).json({ error: "No city name provided" });
  }

  if (!alertMessage) {
    return res.status(401).json({ error: "No alert message provided" });
  }

  if (!ALERT_TYPES.includes(alertSeverity)) {
    return res.status(400).json({
      error: "Invalid alertSeverity",
      allowed: ALERT_TYPES,
    });
  }

  websocketService.sendToCity(cityName, {
    type: "alert",
    cityName,
    alertSeverity,
    alertMessage,
  });
  res.json({ success: true, cityName });
};

export default {
  sendAlert,
};
