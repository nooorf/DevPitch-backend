import express from "express";
import passport from "../auth/github.js";

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const { user, token } = req.user;
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("token");
    res.redirect("http://localhost:3000");
  });
});

export default router;
