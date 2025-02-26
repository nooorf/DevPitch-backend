import express from "express";
import passport from "../auth/github.js";
import UserModel from "../models/UserModel.js";

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const { user, token } = req.user;
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "none",
    });
    res.redirect(`http://localhost:3000/dashboard`);
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "none",
    });
    res.json({ message: "Logged out" });
    res.redirect("http://localhost:3000");
  });
});

router.get("/me", verifyToken, async (req, res) => {
  try{
    const user = await UserModel.findById(req.user.userId).select("-password");
    if(!user) return res.status(404).json({message: "User not found"});
    res.json(user);
  }
  catch(err){
    console.err(err);
    res.status(500).json({message: err.message});
  }
});
export default router;
