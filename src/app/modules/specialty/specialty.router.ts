import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createSpecialtySchema,
  updateSpecialtySchema,
} from "./specialty.schema";

const router = Router();

router.post(
  "/",
  validateRequest(createSpecialtySchema),
  SpecialtyController.createSpecialty,
);
router.get("/", SpecialtyController.getAllSpecialties);
router.patch(
  "/:id",
  validateRequest(updateSpecialtySchema),
  SpecialtyController.updateSpecialty,
);
router.delete("/:id", SpecialtyController.deleteSpecialty);

export const SpecialtyRouter = router;
