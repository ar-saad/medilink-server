import { Router } from "express";
import { SpecialtyRouter } from "../modules/specialty/specialty.router";
import { AuthRouter } from "../modules/auth/auth.router";
import { UserRouter } from "../modules/user/user.router";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);
router.use("/users", UserRouter);

export const IndexRouter = router;
