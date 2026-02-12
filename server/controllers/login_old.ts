const express = require("express");

interface Request {
  body: {
    city: string;
  };
}

const getCities = (req: Request, res: Response) => {
  res.json("test success");
};

const setCity = (req: Request, res: Response) => {
  if (!req.body.city) {
    return res.status(400).json({ error: "City is required" });
  }

  res.json("test success");
};

const getWeather = (req: Request, res: Response) => {
  res.json("test success");
};

export default {
  getCities,
  setCity,
  getWeather,
};
