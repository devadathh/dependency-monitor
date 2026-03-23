/**const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user =decoded; // payload must include {id: userId}
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;*/
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
console.log("Auth header token:", token);


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    req.userData = { 
  userId: decoded.userId,
  email: decoded.email // <-- add this here
};// Map userId from JWT payload
    next();

  } catch (err) {
    console.error("JWT verification error:", err); // <-- log the actual error
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
