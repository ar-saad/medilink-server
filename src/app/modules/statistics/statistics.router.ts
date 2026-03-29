import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { StatisticsController } from "./statistics.controller";

const router = Router();

// GET | "/api/v1/statistics" | Get dashboard stats data based on user role
router.get(
  "/",
  checkAuth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PATIENT,
    UserRole.DOCTOR,
  ),
  StatisticsController.getDashboardStatsData,
);

export const StatisticsRouter = router;
