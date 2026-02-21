import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDoctorSchema } from "./user.schema";

const router: Router = Router();

router.post(
  "/create-doctor",
  validateRequest(createDoctorSchema),
  UserController.createDoctor,
);

export const UserRouter = router;
