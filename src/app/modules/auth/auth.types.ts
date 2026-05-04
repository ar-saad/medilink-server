import * as z from "zod";
import {
  changePasswordSchema,
  loginSchema,
  registerPatientSchema,
} from "./auth.schema";

export type TRegisterPatientPayload = z.infer<typeof registerPatientSchema>;

export type TLoginUserPayload = z.infer<typeof loginSchema>;

export type TChangePasswordPayload = z.infer<typeof changePasswordSchema>;

export type TBetterAuthSession = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    role: string;
    status: string;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt?: Date | null | undefined;
  };
};
