import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import {
  TCreateSpecialtyPayload,
  TUpdateSpecialtyPayload,
} from "./specialty.types";

const createSpecialty = async (
  payload: TCreateSpecialtyPayload,
): Promise<Specialty> => {
  const specialty = await prisma.specialty.create({
    data: payload,
  });

  return specialty;
};

const getAllSpecialties = async (): Promise<Specialty[]> => {
  const specialties = await prisma.specialty.findMany();
  return specialties;
};

const updateSpecialty = async (
  id: string,
  payload: TUpdateSpecialtyPayload,
): Promise<Specialty> => {
  const specialty = await prisma.specialty.update({
    where: { id },
    data: payload,
  });
  return specialty;
};

const deleteSpecialty = async (id: string): Promise<Specialty> => {
  const specialty = await prisma.specialty.delete({
    where: { id },
  });
  return specialty;
};

export const SpecialtyService = {
  createSpecialty,
  getAllSpecialties,
  updateSpecialty,
  deleteSpecialty,
};
