import { Router } from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    storeHistory,
    getHistory,
} from "../controllers/user.controlers.js";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(logoutUser);
router.route("/history").post(storeHistory);
router.route("/history/:email").get(getHistory);

export default router;
