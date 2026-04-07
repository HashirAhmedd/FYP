import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };
};

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                status: "failed",
                message: "Missing required fields: fullName, email, password",
            });
        }

        if (fullName.trim().length < 3) {
            return res.status(400).json({
                status: "failed",
                message: "Full name must be at least 3 characters",
            });
        }

        if (!email.includes("@")) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid email format",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: "failed",
                message: "Password must be at least 6 characters",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                status: "failed",
                message: "Email already registered",
            });
        }

        // Create user (password hashing handled by pre-save hook)
        const user = await User.create({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        return res.status(201).json({
            status: "success",
            message: "Signup successful",
            user: createdUser,
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Signup failed",
        });
    }
};

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "failed",
                message: "Missing required fields: email, password",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid email or password",
            });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const cookieOptions = getCookieOptions();

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                status: "success",
                message: "Login successful",
                user: loggedInUser,
                accessToken,
                refreshToken,
            });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Login failed",
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                status: "failed",
                message: "Refresh token is missing",
            });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid refresh token",
            });
        }

        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const cookieOptions = getCookieOptions();

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json({
                status: "success",
                message: "Access token refreshed",
                user: loggedInUser,
                accessToken,
                refreshToken: newRefreshToken,
            });
    } catch (error) {
        return res.status(401).json({
            status: "failed",
            message: "Refresh token expired or invalid",
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (incomingRefreshToken) {
            await User.findOneAndUpdate(
                { refreshToken: incomingRefreshToken },
                { $unset: { refreshToken: 1 } },
                { returnDocument: "after" }
            );
        }

        const cookieOptions = getCookieOptions();

        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({
                status: "success",
                message: "Logout successful",
            });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Logout failed",
        });
    }
};

const storeHistory = async (req, res) => {
    try {
        let { email, sector, emission, yearRange } = req.body;

        if (!email || !sector || !emission || !yearRange) {
            return res.status(400).json({
                status: "failed",
                message: "Missing required fields: email, sector, emission, yearRange",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }

        sector = sector.slice(0, 1).toUpperCase() + sector.slice(1)
        emission = emission.toUpperCase()

        user.history.push({
            sector,
            emission,
            yearRange,
            timestamp: new Date(),
        });

        await user.save({ validateBeforeSave: false });

        return res.status(201).json({
            status: "success",
            message: "History entry stored successfully",
            history: user.history,
        });
    } catch (error) {
        console.error("Store history error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Failed to store history",
        });
    }
};

const getHistory = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                status: "failed",
                message: "Email parameter is required",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("history");
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: "success",
            history: user.history,
        });
    } catch (error) {
        console.error("Get history error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Failed to retrieve history",
        });
    }
};

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    storeHistory,
    getHistory,
};
