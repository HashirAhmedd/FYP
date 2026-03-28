import { Router } from "express";
import { getSectorEmissions } from "../controllers/historical.controller.js";

const router = Router();

router.route("/").post(getSectorEmissions);

export default router;
