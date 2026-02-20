import { Router } from "express";
import { UserController } from "./user.controller";

const router: Router = Router();

router.post("/create-doctor", UserController.createDoctor);

export const UserRouter = router;
