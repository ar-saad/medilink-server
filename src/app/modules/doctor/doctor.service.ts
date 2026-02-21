import { prisma } from "../../lib/prisma";
import { TUpdateDoctorPayload } from "./doctor.types";

const getAllDoctors = async () => {
  return await prisma.doctor.findMany({
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
};

const getDoctorById = async (id: string) => {
  return await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
};

const updateDoctor = async (id: string, data: TUpdateDoctorPayload) => {
  return await prisma.doctor.update({
    where: { id },
    data,
  });
};

const deleteDoctor = async (id: string) => {
  // Soft delete
  return await prisma.doctor.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
