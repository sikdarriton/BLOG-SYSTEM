const jwt = require("jsonwebtoken");


exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required."
        });
    }

    const token = authHeader.split(" ")[1];
    //console.log("Token:", token); // Debugging line to check the token value
    //console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET); // Debugging line to check the secret
    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        
        console.log("Decoded token:", decoded); // Debugging line to check the decoded token

        req.user = {
            id: decoded.sub,
            role: decoded.role
        };

        next();
    } catch (error) {

        //console.error("JWT error name:", error.name);
        console.error("JWT error message:", error.message);

        return res.status(401).json({
            message: error.message
        });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required."
        });
    }

    next();
};