import express from "express";
import profuserModel from "../models/profuserModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    
    const userData = await profuserModel.findOne({ email });
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    if (!userData) {
      return res.status(404).json({ msg: "Not found" });
    }

    res.json(userData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
