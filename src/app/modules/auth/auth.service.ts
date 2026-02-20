import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new Error("Failed to register user");
  }

  const patient = await prisma.$transaction(async (tx) => {
    try {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });

      return patientTx;
    } catch (error) {
      console.log("Transaction error: ", error);
      await prisma.user.delete({
        where: {
          id: data.user.id,
        },
      });
      throw error;
    }
  });

  return { ...data, patient };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("Your account has been blocked. Please contact support.");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new Error("Your account has been deleted. Please contact support.");
  }

  return data;
};

export const AuthService = {
  registerPatient,
  loginUser,
};
