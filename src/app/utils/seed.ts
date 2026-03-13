import { UserRole } from "../../generated/prisma/enums";
import { env } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super Admin already exists");
      return;
    }

    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: env.SUPER_ADMIN.EMAIL,
        password: env.SUPER_ADMIN.PASSWORD,
        name: "Super Admin",
        role: UserRole.SUPER_ADMIN,
        needPasswordChange: false,
        rememberMe: false,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: superAdminUser.user.id,
        },
        data: {
          emailVerified: true,
        },
      });

      await tx.superAdmin.create({
        data: {
          userId: superAdminUser.user.id,
          name: "Super Admin",
          email: env.SUPER_ADMIN.EMAIL,
        },
      });
    });

    const superAdmin = await prisma.superAdmin.findFirst({
      where: {
        email: env.SUPER_ADMIN.EMAIL,
      },
      include: {
        user: true,
      },
    });

    console.log("Super Admin seeded successfully:", superAdmin);
  } catch (error) {
    console.error("Error occurred while seeding super admin:", error);

    // Cascade rule will automatically delete the super admin if user creation fails
    await prisma.user.delete({
      where: {
        email: env.SUPER_ADMIN.EMAIL,
      },
    });
  }
};
