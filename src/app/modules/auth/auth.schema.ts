import * as z from "zod";

export const registerPatientSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters long"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, "Current password must be at least 6 characters long"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

export const verifyEmailSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  otp: z.string().length(6, "OTP must be 6 characters long"),
});

export const resendOTPSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
});
