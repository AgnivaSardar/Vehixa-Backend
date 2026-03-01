import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { healthController } from "./health.controller";

const router = Router();

router.use(authenticate);
router.get("/", healthController.list);
router.get("/:predictionId", healthController.getById);

export default router;
