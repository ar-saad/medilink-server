import { Router } from "express";
import { PatientController } from "./patient.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { updatePatientProfileSchema } from "./patient.schema";
import { multerUpload } from "../../config/multer.config";
import { attachUrlToPatientProfileUpdateRequestBody } from "./patient.middleware";

const router = Router();

// PATCH | "/api/v1/patients/my-profile" | Update patient's own profile
router.patch(
  "/my-profile",
  checkAuth(UserRole.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  attachUrlToPatientProfileUpdateRequestBody,
  validateRequest(updatePatientProfileSchema),
  PatientController.updateMyProfile,
);

// GET | "/api/v1/patients/my-profile" | Get patient's own profile
router.get(
  "/my-profile",
  checkAuth(UserRole.PATIENT),
  PatientController.getMyProfile,
);

export const PatientRouter = router;
