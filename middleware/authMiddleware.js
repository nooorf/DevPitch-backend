import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    console.log("Verify token middleware triggered");
    console.log("Cookies received:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);
    const token =
    req.cookies["authToken"] ||
      req.headers.authorization?.split(" ")[1];

    console.log("Token extracted:", token); 

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); 

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};


export const verifyModerator = (req, res, next) => {
  console.log("Verify moderator middleware triggered");
  console.log("User found in request to verifyModerator:", req.user);
  if (!req.user) {
    console.log("No user found in request, rejecting access");
    return res.status(403).json({ message: "Forbidden - No user found" });
  }

  if (req.user.role !== "moderator") {
    console.log("User is not a moderator, rejecting access");
    return res.status(403).json({ message: "Forbidden - Moderator access only" });
  }

  console.log("User is a moderator, granting access");
  next();
};
