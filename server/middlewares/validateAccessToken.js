const jwt = require("jsonwebtoken");

const validateAccessToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "You are not logged in!",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET_KEY
        );

        // decoded is guaranteed here
        const { username, email } = decoded;

        req.user = { username, email }; // REQUIRED for topicController
        next(); // ✅ safe
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Unauthorized! Access Token was expired!",
            });
        }

        return res.status(401).json({
            message: "Unauthorized!",
        });
    }
};

module.exports = validateAccessToken;
