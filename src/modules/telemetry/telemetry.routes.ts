import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { telemetryController } from "./telemetry.controller";
import { createTelemetrySchema } from "./telemetry.validation";
import { verifyVehicleApiKey } from "../../middlewares/apiKey.middleware";

const router = Router();

router.post("/",verifyVehicleApiKey, optionalAuthenticate, validateBody(createTelemetrySchema), telemetryController.ingest);
router.get("/", authenticate, telemetryController.list);
router.get("/:telemetryId", authenticate, telemetryController.getById);

export default router;
