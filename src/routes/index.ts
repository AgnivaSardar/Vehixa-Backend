import { Router } from "express";
import alertsRoutes from "../modules/alerts/alerts.routes";
import healthRoutes from "../modules/health_predictions/health.routes";
import modelRoutes from "../modules/model_metadata/model.routes";
import recommendationRoutes from "../modules/recommendations/recommendations.routes";
import telemetryRoutes from "../modules/telemetry/telemetry.routes";
import usersRoutes from "../modules/users/users.routes";
import vehiclesRoutes from "../modules/vehicles/vehicles.routes";
import contactRoutes from "../modules/contact/contact.routes";

const apiRouter = Router();

apiRouter.use("/users", usersRoutes);
apiRouter.use("/vehicles", vehiclesRoutes);
apiRouter.use("/telemetry", telemetryRoutes);
apiRouter.use("/health-predictions", healthRoutes);
apiRouter.use("/recommendations", recommendationRoutes);
apiRouter.use("/alerts", alertsRoutes);
apiRouter.use("/model-metadata", modelRoutes);
apiRouter.use("/contact", contactRoutes);

export default apiRouter;
