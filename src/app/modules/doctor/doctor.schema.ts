import * as z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateDoctorSchema = z
  .object({
    name: z
      .string("Name must be a string")
      .min(5, "Name must be at least 5 characters long")
      .max(100, "Name must be less than 100 characters long"),
    profilePhoto: z.url("Profile photo must be a valid URL"),
    contactNumber: z
      .string("Contact number must be a string")
      .min(11, "Contact number must be at least 11 digits")
      .max(14, "Contact number must be less than 14 digits"),
    address: z
      .string("Address must be a string")
      .min(10, "Address must be at least 10 characters long"),
    registrationNumber: z.string("Registration number must be a string"),
    experience: z
      .number("Experience must be a number")
      .nonnegative("Experience must be a non-negative number")
      .max(50, "Experience must be less than 50 years"),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE],
      "Gender must be either MALE or FEMALE",
    ),
    appointmentFee: z
      .number("Appointment fee must be a number")
      .positive("Appointment fee must be a positive number"),
    qualification: z
      .string("Qualification must be a string")
      .min(5, "Qualification must be at least 5 characters long"),
    currentWorkingPlace: z
      .string("Current working place must be a string")
      .min(5, "Current working place must be at least 5 characters long"),
    designation: z
      .string("Designation must be a string")
      .min(5, "Designation must be at least 5 characters long"),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
