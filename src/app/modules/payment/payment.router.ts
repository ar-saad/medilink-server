import express, { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

export const PaymentRouter = router;
