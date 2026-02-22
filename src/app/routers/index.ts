import { Router } from "express";
import { SpecialtyRouter } from "../modules/specialty/specialty.router";
import { AuthRouter } from "../modules/auth/auth.router";
import { UserRouter } from "../modules/user/user.router";
import { DoctorRouter } from "../modules/doctor/doctor.router";
import { AdminRouter } from "../modules/admin/admin.router";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);
router.use("/users", UserRouter);
router.use("/doctors", DoctorRouter);
router.use("/admins", AdminRouter);

export const IndexRouter = router;
