import jwt from "jsonwebtoken";

class verifyToken { 

 async verify(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "Unauthorized: Token missing" });

    const token = authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Unauthorized: Invalid token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach decoded payload to req.user

    next();

  } catch (error) {
    console.error("Token verify error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
}
export default verifyToken;