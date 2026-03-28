import { UserRole } from "../../../generated/prisma/enums";
import { BadRequestError, NotFoundError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { TCreateReviewPayload, TUpdateReviewPayload } from "./review.types";

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

// GET | "/api/v1/reviews" | Get all reviews
const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  return reviews;
};

// GET | "/api/v1/reviews/my-reviews" | Get my reviews (for patient and doctor)
const myReviews = async (user: TRequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExist) {
    throw new NotFoundError("Patient not found");
  }

  if (isUserExist.role === UserRole.DOCTOR) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user?.email,
      },
    });

    return await prisma.review.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        appointment: true,
      },
    });
  }

  if (isUserExist.role === UserRole.PATIENT) {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user?.email,
      },
    });

    return await prisma.review.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        appointment: true,
      },
    });
  }
};

// PATCH | "/api/v1/reviews/:id" | Patient update a review
const updateReview = async (
  user: TRequestUser,
  reviewId: string,
  payload: TUpdateReviewPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });

  if (patientData.id !== reviewData.patientId) {
    throw new BadRequestError("You can only update your own reviews!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: {
        id: reviewId,
      },
      data: {
        ...payload,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: reviewData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: updatedReview.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating ?? 0,
      },
    });

    return updatedReview;
  });

  return result;
};

// DELETE | "/api/v1/reviews/:id" | Patient delete a review
const deleteReview = async (user: TRequestUser, reviewId: string) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });

  if (patientData.id !== reviewData.patientId) {
    throw new BadRequestError("You can only delete your own reviews!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: {
        id: reviewId,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: deletedReview.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: deletedReview.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating ?? 0,
      },
    });

    return deletedReview;
  });

  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};
