import { Router } from "express";
import { SpecialtyRouter } from "../modules/specialty/specialty.router";
import { AuthRouter } from "../modules/auth/auth.router";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);

export const IndexRouter = router;
