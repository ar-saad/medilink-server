import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateDoctorSchema } from "./doctor.schema";

const router: Router = Router();

router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);
router.patch(
  "/:id",
  validateRequest(updateDoctorSchema),
  DoctorController.updateDoctor,
);
router.delete("/:id", DoctorController.deleteDoctor);

export const DoctorRouter = router;
