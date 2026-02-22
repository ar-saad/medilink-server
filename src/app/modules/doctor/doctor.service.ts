import { UserStatus } from "../../../generated/prisma/enums";
import { NotFoundError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TUpdateDoctorPayload } from "./doctor.types";

// GET | "/api/v1/doctors" | Get all doctors
const getAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  return doctors;
};

// GET | "/api/v1/doctors/:id" | Get doctor by ID
const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new NotFoundError("Doctor not found");
  }

  return doctor;
};

// PATCH | "/api/v1/doctors/:id" | Update doctor by ID
const updateDoctor = async (id: string, payload: TUpdateDoctorPayload) => {
  // Check if doctor exists and not deleted
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingDoctor) {
    throw new NotFoundError("Doctor not found");
  }

  // Separate specialties from doctor data
  const { specialties, ...doctorData } = payload;

  await prisma.$transaction(async (tx) => {
    // Update doctor basic information
    await tx.doctor.update({
      where: { id },
      data: doctorData,
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    // If specialties are provided, update them separately
    if (specialties && specialties.length > 0) {
      // Delete old specialties
      await tx.doctorSpecialty.deleteMany({
        where: { doctorId: id },
      });

      // Add new specialties
      const specialtiesData = specialties.map((specialtyId) => ({
        doctorId: id,
        specialtyId,
      }));

      await tx.doctorSpecialty.createMany({
        data: specialtiesData,
      });
    }
  });

  // Fetch updated doctor with new specialties
  const result = await getDoctorById(id);

  return result;
};

// DELETE | "/api/v1/doctors/:id" | Soft delete doctor by ID
const deleteDoctor = async (id: string) => {
  const isDoctorExist = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!isDoctorExist) {
    throw new NotFoundError("Doctor not found");
  }

  await prisma.$transaction(async (tx) => {
    // Soft delete doctor
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Soft delete associated user
    await tx.user.update({
      where: { id: isDoctorExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    // Delete sessions associated with the user
    await tx.session.deleteMany({
      where: { userId: isDoctorExist.userId },
    });

    await tx.account.deleteMany({
      where: { userId: isDoctorExist.userId },
    });

    // Delete doctor specialties
    await tx.doctorSpecialty.deleteMany({
      where: { doctorId: id },
    });
  });

  return { message: "Doctor deleted successfully" };
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
