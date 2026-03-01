import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { modelController } from "./model.controller";

const router = Router();

router.use(authenticate);
router.post("/", modelController.create);
router.get("/", modelController.list);
router.get("/latest", modelController.latest);
router.get("/:version", modelController.getByVersion);

export default router;
