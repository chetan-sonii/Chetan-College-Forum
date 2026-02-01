const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); //

// Make the function async to allow database calls
const validateAccessToken = async (req, res, next) => {
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

        const { email } = decoded;

        // CRITICAL FIX: Fetch the user from DB to get the _id
        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User belonging to this token no longer exists.",
            });
        }

        // Now req.user contains the full user object, including _id
        req.user = user;
        next();
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