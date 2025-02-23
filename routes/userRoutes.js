import express from 'express';
import UserModel from '../models/UserModel';

const router = express.Router();

router.get("/getusers", async (req, res) => {
    const userData = await UserModel.find();
    res.json(userData);
});

export default router;