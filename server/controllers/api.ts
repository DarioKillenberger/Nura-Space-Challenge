import express, { Request, Response } from "express";

const router = express.Router();

// Get all issues from database
router.get("/issues", (req: Request, res: Response) => {
  try {
    res.json("test success");
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
