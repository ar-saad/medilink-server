import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";

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

const updateDoctor = async (id: string, data: IUpdateDoctorPayload) => {
  return await prisma.doctor.update({
    where: { id },
    data,
  });
};

const deleteDoctor = async (id: string) => {
  return await prisma.doctor.delete({
    where: { id },
  });
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
