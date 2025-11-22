const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  try{
    const token =
      req.cookies?.sweetToken ||
      req.headers.authorization?.split(" ")[1] ||
      req.body?.token
    if (!token) {
      return res.status(401).json({ message: "Not Logged In" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.admin = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid Token" });
    }
  }
  catch(e){
    res.status(500).json({
      message:"Something went wrong"
    })
  }
};
