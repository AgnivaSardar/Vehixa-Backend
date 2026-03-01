import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { recommendationsController } from "./recommendations.controller";

const router = Router();

router.use(authenticate);
router.get("/", recommendationsController.list);
router.get("/:recommendationId", recommendationsController.getById);

export default router;
