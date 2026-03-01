import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware";
import apiRouter from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(apiRateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    app: "Vehixa",
    status: "ok",
    time: new Date().toISOString(),
  });
});

app.use(env.API_PREFIX, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
