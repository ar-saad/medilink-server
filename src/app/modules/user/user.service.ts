import { Specialty, UserRole } from "../../../generated/prisma/client";
import { BadRequestError, NotFoundError } from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import {
  TCreateAdminPayload,
  TCreateDoctorPayload,
  TCreateSuperAdminPayload,
} from "./user.types";

// POST | "/api/v1/users/create-doctor" | Create a new doctor user
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

      // Fetch the created doctor with specialties and user details
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

// POST | "/api/v1/users/create-admin" | Create a new admin user (requires SUPER_ADMIN role)
const createAdmin = async (payload: TCreateAdminPayload) => {
  // Step 1: Check if user with the same email already exists
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new BadRequestError("Admin with this email already exists");
  }

  // Step 2: Create user in auth system
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      role: UserRole.ADMIN,
      name: payload.admin.name,
      needPasswordChange: true,
      rememberMe: false,
    },
  });

  // Step 3: Create admin profile using transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create admin profile linked to the user
      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.admin,
        },
      });

      // Fetch the created admin with user details
      const admin = await tx.admin.findUnique({
        where: {
          id: adminData.id,
        },
        include: {
          user: true,
        },
      });

      return admin;
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

// POST | "/api/v1/users/create-super-admin" | Create a new super admin user (requires SUPER_ADMIN role)
const createSuperAdmin = async (payload: TCreateSuperAdminPayload) => {
  // Step 1: Check if user with the same email already exists
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.superAdmin.email,
    },
  });

  if (userExists) {
    throw new BadRequestError("Super Admin with this email already exists");
  }

  // Step 2: Create user in auth system
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.superAdmin.email,
      password: payload.password,
      role: UserRole.SUPER_ADMIN,
      name: payload.superAdmin.name,
      needPasswordChange: true,
      rememberMe: false,
    },
  });

  // Step 3: Create super admin profile using transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create super admin profile linked to the user
      const superAdminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.superAdmin,
        },
      });

      // Fetch the created super admin with user details
      const superAdmin = await tx.admin.findUnique({
        where: {
          id: superAdminData.id,
        },
        include: {
          user: true,
        },
      });

      return superAdmin;
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
  createAdmin,
  createSuperAdmin,
};
