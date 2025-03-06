import express from "express";
import profuserModel from "../models/profuserModel.js";
import nodemailer from "nodemailer";

const router = express.Router();
const otpStorage = {}; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ridatayyab186@gmail.com", 
    pass: process.env.EMAIL_PASSWORD,
  },
});

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    const existingUser = await profuserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    const otp = generateOTP();
    otpStorage[email] = otp;

    const mailOptions = {
      from: "ridatayyab186@gmail.com",
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: "OTP sent successfully", email });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error });
  }
});

// verify OTP and register user
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }
    if (!otpStorage[email]) {
      return res.status(400).json({ msg: "No OTP found for this email" });
    }
    if (otpStorage[email] !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    const newUser = new profuserModel({ email });
    await newUser.save();

    delete otpStorage[email];

    res.json({ msg: "Email verified and user registered successfully", user: newUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
