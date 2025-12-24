import ratelimit from "../config/upstash.js"; // Fixed import path

export const rateLimitMiddleware = async (req, res, next) => {
  try {
    const ip = req.ip;
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return res.status(429).json({ 
        message: "Too many requests. Please try again later." 
      });
    }
    
    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default rateLimitMiddleware; 