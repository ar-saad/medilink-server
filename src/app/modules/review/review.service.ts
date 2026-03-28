import { BadRequestError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { TCreateReviewPayload } from "./review.types";

// POST | "/api/v1/reviews" | Patient create a review for an appointment
const createReview = async (
  user: TRequestUser,
  payload: TCreateReviewPayload,
) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (appointment.paymentStatus !== "PAID") {
    throw new BadRequestError(
      "You can only review an appointment after payment for it is completed",
    );
  }

  if (appointment.patientId !== patient.id) {
    throw new BadRequestError("You can only review your own appointments");
  }

  const isReviewed = await prisma.review.findFirst({
    where: {
      appointmentId: appointment.id,
    },
  });

  if (isReviewed) {
    throw new BadRequestError(
      "You have already reviewed this appointment. You can update your existing review instead.",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...payload,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: appointment.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: appointment.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating ?? 0,
      },
    });

    return review;
  });

  return result;
};

export const ReviewService = {
  createReview,
};
