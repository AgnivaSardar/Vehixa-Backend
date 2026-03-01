import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { vehiclesController } from "./vehicles.controller";
import { createVehicleSchema, updateVehicleSchema } from "./vehicles.validation";

const router = Router();

router.use(authenticate);
router.post("/", validateBody(createVehicleSchema), vehiclesController.create);
router.get("/", vehiclesController.list);
router.get("/:vehicleId", vehiclesController.getById);
router.patch("/:vehicleId", validateBody(updateVehicleSchema), vehiclesController.update);
router.delete("/:vehicleId", vehiclesController.remove);

export default router;
