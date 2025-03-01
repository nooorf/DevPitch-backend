import express from 'express';
import UserModel from '../models/userModel.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const userData = await UserModel.find();
    res.json(userData);
});

export default router;