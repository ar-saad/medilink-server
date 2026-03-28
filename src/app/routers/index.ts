import { Router } from "express";
import { SpecialtyRouter } from "../modules/specialty/specialty.router";
import { AuthRouter } from "../modules/auth/auth.router";
import { UserRouter } from "../modules/user/user.router";
import { DoctorRouter } from "../modules/doctor/doctor.router";
import { AdminRouter } from "../modules/admin/admin.router";
import { ScheduleRouter } from "../modules/schedule/schedule.router";
import { DoctorScheduleRouter } from "../modules/doctorSchedule/doctorSchedule.router";
import { AppointmentRouter } from "../modules/appointment/appointment.router";
import { PatientRouter } from "../modules/patient/patient.router";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);
router.use("/users", UserRouter);
router.use("/patients", PatientRouter);
router.use("/doctors", DoctorRouter);
router.use("/admins", AdminRouter);
router.use("/schedules", ScheduleRouter);
router.use("/doctor-schedules", DoctorScheduleRouter);
router.use("/appointments", AppointmentRouter);

export const IndexRouter = router;
