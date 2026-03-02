import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { Role } from "../../generated/prisma/enums";
import { usersController } from "./users.controller";
import { loginSchema, registerUserSchema } from "./users.validation";

const router = Router();

router.post("/register", validateBody(registerUserSchema), usersController.register);
router.post("/login", validateBody(loginSchema), usersController.login);

// OTP-based authentication (new flow - optional)
router.post("/otp/send", usersController.sendOTP);
router.post("/otp/verify", usersController.verifyOTP);

router.get("/me", authenticate, usersController.me);
router.get("/", authenticate, requireRole(Role.ADMIN), usersController.list);

export default router;
