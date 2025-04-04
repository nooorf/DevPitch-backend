import express from "express";
import profuserModel from "../models/profuserModel.js";
import nodemailer from "nodemailer";

var useremail="";
const router = express.Router();
const otpStorage = {}; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ridatayyab186@gmail.com", 
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
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
    if (!email) {
      return res.status(400).json({ msg: "Provide email" });
    }
    if (!otpStorage[email]) {
      return res.status(400).json({ msg: "No OTP found for this email" });
    }
    if (otpStorage[email] !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    useremail=email;
    delete otpStorage[email];

    const existingUser = await profuserModel.findOne({ email: email });
    const isExisting = existingUser ? true : false;
    console.log(isExisting);

    res.json({ msg: "Email verified", isExisting });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/saveuser", async (req, res) => {
  try {
    const { username, bio, pfp } = req.body;
    console.log(useremail);

    const existingUser = await profuserModel.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ msg: "Username already exists. Please choose another." });
    }

    const newUser = new profuserModel({ email: useremail, username, bio, pfp });
    await newUser.save();

    res.json({ msg: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
