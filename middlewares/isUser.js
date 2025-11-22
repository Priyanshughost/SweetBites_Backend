const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    const token =
        req.cookies?.sweetToken ||
        req.headers.authorization?.split(" ")[1] ||
        req.body?.token

    if (!token) {
        return res.status(401).json({ message: "Not Logged In" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // req.user = decoded
        if(decoded.role !== "user"){
            return res.status(403).json({message:"Access Denied"})
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or Expired Token" })
    }
};
