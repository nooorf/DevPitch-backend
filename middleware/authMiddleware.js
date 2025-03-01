import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
  const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const verifyModerator = (req, res, next) => {
  if(!req.user || req.user.role !== "moderator"){
    return res.status(403).json({message: "Forbidden - Moderator access only"});
  }
};
