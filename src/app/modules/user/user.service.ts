import { Specialty, UserRole } from "../../../generated/prisma/client";
import { BadRequestError, NotFoundError } from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TCreateDoctorPayload } from "./user.types";

const createDoctor = async (payload: TCreateDoctorPayload) => {
  const specialties: Specialty[] = [];

  for (const specialtyId of payload.specialties) {
    const specialtyRecord = await prisma.specialty.findUnique({
      where: {
        id: specialtyId,
      },
    });
    if (!specialtyRecord) {
      throw new NotFoundError(`Specialty with ID ${specialtyId} not found`);
    }
    specialties.push(specialtyRecord);
  }

  const userExists = await prisma.doctor.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (userExists) {
    throw new BadRequestError("Doctor with this email already exists");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: UserRole.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,
    },
  });

  if (!userData.user) {
    throw new BadRequestError("Failed to register user");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });

      // Create doctor-specialty array for bulk creation
      const doctorSpecialties = specialties.map((specialty) => ({
        doctorId: doctorData.id,
        specialtyId: specialty.id,
      }));

      // Create doctorSpecialty records in bulk
      await tx.doctorSpecialty.createMany({
        data: doctorSpecialties,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      return doctor;
    });

    return result;
  } catch (error) {
    console.error("Transaction error:", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

export const UserService = {
  createDoctor,
};
