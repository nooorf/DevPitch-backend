import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("GitHub Profile:", profile);

        let user = await UserModel.findOne({ githubId: profile.id });

        if (!user) {
          user = new UserModel({
            githubId: profile.id,
            name: profile.displayName,
            githubUsername: profile.username,
            email: profile.emails?.[0]?.value || "",
            profilePicture: profile.photos?.[0]?.value || "",
          });
          await user.save();
        }

        const token = jwt.sign(
          { userId: user._id, githubUsername: user.githubUsername, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        console.log("Token generated printed from github.js:", token);

        return done(null, { user, token }); 
      } catch (err) {
        console.log("Error printed from github.js:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;

