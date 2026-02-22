import * as z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
  doctor: z.object({
    name: z
      .string()
      .min(5, "Name must be at least 5 characters long")
      .max(100, "Name must be less than 100 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z
      .string()
      .min(11, "Contact number must be at least 11 digits")
      .max(14, "Contact number must be less than 14 digits"),
    address: z.string().min(10, "Address must be at least 10 characters long"),
    registrationNumber: z.string(),
    experience: z
      .number()
      .nonnegative("Experience must be a non-negative number")
      .max(50, "Experience must be less than 50 years"),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE, Gender.OTHER],
      "Gender must be either MALE, FEMALE, or OTHER",
    ),
    appointmentFee: z
      .number()
      .positive("Appointment fee must be a positive number"),
    qualification: z
      .string()
      .min(5, "Qualification must be at least 5 characters long"),
    currentWorkingPlace: z
      .string()
      .min(5, "Current working place must be at least 5 characters long"),
    designation: z
      .string()
      .min(5, "Designation must be at least 5 characters long"),
  }),
  specialties: z
    .array(z.uuid("Each specialty must be a valid UUID"))
    .min(1, "At least one specialty is required"),
});

export const createAdminSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
  admin: z.object({
    name: z.string().min(1, "Name is required and must be a string"),
    email: z.email("Invalid email address"),
    profilePhoto: z.url("Profile photo must be a valid URL").optional(),
    contactNumber: z
      .string()
      .min(11, "Contact number must be at least 11 digits")
      .max(14, "Contact number must be less than 14 digits"),
    address: z.string().min(10, "Address must be at least 10 characters long"),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE, Gender.OTHER],
      "Gender must be either MALE, FEMALE, or OTHER",
    ),
  }),
});

export const createSuperAdminSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
  superAdmin: z.object({
    name: z.string().min(1, "Name is required and must be a string"),
    email: z.email("Invalid email address"),
    profilePhoto: z.url("Profile photo must be a valid URL").optional(),
    contactNumber: z
      .string()
      .min(11, "Contact number must be at least 11 digits")
      .max(14, "Contact number must be less than 14 digits"),
    address: z.string().min(10, "Address must be at least 10 characters long"),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE, Gender.OTHER],
      "Gender must be either MALE, FEMALE, or OTHER",
    ),
  }),
});
