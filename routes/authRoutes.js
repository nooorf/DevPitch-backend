
import express from "express";
import passport from "../auth/github.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import UserModel from "../models/userModel.js";

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  async (req, res) => {
    try {
      console.log("GitHub Callback req.user:", req.user);

      if (!req.user || !req.user.user || !req.user.token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { user, token } = req.user;

      res.cookie("authToken", token, {
        httpOnly: true, 
        secure: false, 
        sameSite: "Lax", 
      });

      console.log("Cookies sent:", res.getHeaders()["set-cookie"]);
      console.log("JWT Token Created and Set in Cookie:", token);
      
      res.redirect("http://localhost:3000"); 
    } catch (err) {
      console.error("JWT Error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);


router.get("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    sameSite: "Lax",
  });

  res.json({ message: "Logged out" });
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

