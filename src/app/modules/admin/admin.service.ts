import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { TUpdateAdminPayload } from "./admin.types";
import { BadRequestError, NotFoundError } from "../../errorHelpers/AppError";
import { TRequestUser } from "../../types/requestUser.type";

// GET | "/api/v1/admins" | Get all admins
const getAllAdmins = async () => {
  const admins = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
  return admins;
};

// GET | "/api/v1/admins/:id" | Get admin by ID
const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return admin;
};

// PATCH | "/api/v1/admins/:id" | Update admin by ID
const updateAdmin = async (id: string, payload: TUpdateAdminPayload) => {
  //TODO: Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user

  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
    },
  });

  if (!isAdminExist) {
    throw new NotFoundError("Admin Or Super Admin not found");
  }

  const updatedAdmin = await prisma.admin.update({
    where: {
      id,
    },
    data: payload,
  });

  return updatedAdmin;
};

// DELETE | "/api/v1/admins/:id" | Soft delete admin by ID
const deleteAdmin = async (id: string, user: TRequestUser) => {
  //TODO: Validate who is deleting the admin user. Only super admin can delete admin user and only super admin can delete super admin user but admin user cannot delete super admin user
  //TODO: a super admin can not delete himself

  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
    },
  });

  if (!isAdminExist) {
    throw new NotFoundError("Admin not found");
  }

  // Prevent super admin from deleting himself
  if (isAdminExist.userId === user.id) {
    throw new BadRequestError("You cannot delete yourself");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isAdminExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    await tx.account.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    const admin = await getAdminById(id);

    return admin;
  });

  return result;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
