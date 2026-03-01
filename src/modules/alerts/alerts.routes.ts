import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { alertsController } from "./alerts.controller";

const router = Router();

router.use(authenticate);
router.get("/", alertsController.list);
router.get("/:alertId", alertsController.getById);
router.patch("/:alertId/resolve", alertsController.resolve);

export default router;
