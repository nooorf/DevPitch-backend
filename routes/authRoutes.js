import express from "express";
import passport from "../auth/github.js";

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

export default router;
