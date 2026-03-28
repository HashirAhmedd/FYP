import { Router } from "express";
import { downloadData } from "../controllers/data.controller.js";

const router = Router();

router.route("/download").get(downloadData);

export default router;
