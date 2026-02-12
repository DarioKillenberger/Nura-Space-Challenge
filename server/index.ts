import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth";
import { weatherRouter, userCityRouter } from "./routers/weather";
import { requireAuth } from "./middleware/auth";
import "./services/websocket";
import { alertsRouter } from "./routers/alerts";

const app = express();
const port = 3000;

// CORS - MUST allow credentials for cookies
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true, // Important!
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello World is this real" });
});

// Auth routes (public)
app.use("/api/auth", authRouter);

// Weather & user city routes (protected - all require auth)
app.use("/api/weather", requireAuth, weatherRouter);
app.use("/api/user-city", requireAuth, userCityRouter);
app.use("/api/alerts", alertsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
