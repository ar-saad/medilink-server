import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { env } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";

const handleStripeWebhookEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = env.STRIPE.WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      sendResponse(res, {
        statusCode: status.BAD_REQUEST,
        success: false,
        message: "Missing Stripe signature or webhook secret",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.error("Error constructing Stripe webhook event:", error);
      return res.status(status.BAD_REQUEST).json({
        message: "Invalid Stripe webhook signature",
      });
    }

    try {
      const result = await PaymentService.handleStripeWebhookEvent(event);
      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Stripe webhook event processed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error handling Stripe webhook event:", error);
      sendResponse(res, {
        statusCode: status.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error handling Stripe webhook event",
      });
    }
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
