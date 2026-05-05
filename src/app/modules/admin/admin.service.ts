import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  TChangeUserRolePayload,
  TChangeUserStatusPayload,
  TUpdateAdminPayload,
} from "./admin.types";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errorHelpers/AppError";
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

// PATCH | "/api/v1/admins/change-user-status" | Change user status (BLOCKED or ACTIVE)
const changeUserStatus = async (
  user: TRequestUser,
  payload: TChangeUserStatusPayload,
) => {
  // 1. Super admin can change the status of any user except himself.
  // 2. Admin can change the status of any user except super admin, another admin and of himself

  const { userId, status } = payload;

  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const isSelfStatusChange = user.id === userToChangeStatus.id;

  // User cannot change their own status
  if (isSelfStatusChange) {
    throw new BadRequestError("You cannot change your own status");
  }

  // Admin cannot change the status of super admin
  if (
    user.role === UserRole.ADMIN &&
    userToChangeStatus.role === UserRole.SUPER_ADMIN
  ) {
    throw new ForbiddenError("Admin cannot change the status of super admin");
  }

  // Admin cannot change the status of other admin
  if (
    user.role === UserRole.ADMIN &&
    userToChangeStatus.role === UserRole.ADMIN
  ) {
    throw new ForbiddenError("Admin cannot change the status of other admin");
  }

  // The status cannot be changed to deleted. To delete a user, the role specific delete user endpoint must be used
  if (status === UserStatus.DELETED) {
    throw new BadRequestError(
      "You cannot change the status to deleted. To delete a user, please use the role specific delete user endpoint",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
  });

  return updatedUser;
};

// PATCH | "/api/v1/admins/change-user-role" | Change user role (Super Admin only)
const changeUserRole = async (
  user: TRequestUser,
  payload: TChangeUserRolePayload,
) => {
  // 1. Super Admin cannot change their own role.
  // 2. Super admin can promote an admin to super admin and can demote a super admin to admin.
  // 3. Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and re-created with the new role

  const { userId, role } = payload;

  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const isSelfRoleChange = user.id === userToChangeRole.id;

  // Super admin cannot change their own role
  if (isSelfRoleChange) {
    throw new BadRequestError("You cannot change your own role");
  }

  // Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and re-created with the new role
  if (
    userToChangeRole.role === UserRole.PATIENT ||
    userToChangeRole.role === UserRole.DOCTOR
  ) {
    throw new BadRequestError(
      "Role of Patient and Doctor user cannot be changed. If needed, please delete and re-create the user with the new role",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  return updatedUser;
};

// DELETE | "/api/v1/admins/:id" | Soft delete admin by ID
const deleteAdmin = async (id: string, user: TRequestUser) => {
  //TODO: Validate who is deleting the admin user. Only super admin can delete admin user and only super admin can delete super admin user but admin user cannot delete super admin user

  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
    },
  });

  if (!isAdminExist) {
    throw new NotFoundError("Admin not found");
  }

  // Prevent admin and super admin users from deleting himself
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
  changeUserStatus,
  changeUserRole,
  deleteAdmin,
};
