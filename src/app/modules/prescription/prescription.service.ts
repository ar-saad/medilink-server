import { UserRole } from "../../../generated/prisma/enums";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../config/cloudinary.config";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { sendEmail } from "../../utils/email";
import { TCreatePrescriptionPayload } from "./prescription.types";
import { generatePrescriptionPDF } from "./prescription.utils";

// GET | "/api/v1/prescriptions" | Get all prescriptions (Admin only)
const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  return result;
};

// GET | "/api/v1/prescriptions/my-prescriptions" | Get prescriptions for the logged-in user (Doctor or Patient)
const myPrescriptions = async (user: TRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new NotFoundError("User not found");
  }

  if (isUserExists.role === UserRole.DOCTOR) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctor: {
          email: user?.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }

  if (isUserExists.role === UserRole.PATIENT) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient: {
          email: user?.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }
};

// POST | "/api/v1/prescriptions" | Create a new prescription for an appointment
const createPrescription = async (
  user: TRequestUser,
  payload: TCreatePrescriptionPayload,
) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          specialties: true,
        },
      },
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
  });

  if (appointment.doctorId !== doctor.id) {
    throw new ForbiddenError(
      "You can only give prescriptions for your own appointments",
    );
  }

  const isAlreadyPrescribed = await prisma.prescription.findUnique({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (isAlreadyPrescribed) {
    throw new BadRequestError(
      "A prescription already exists for this appointment",
    );
  }

  const followUpDate = new Date(payload.followUpDate);

  const prescription = await prisma.$transaction(
    async (tx) => {
      const result = await tx.prescription.create({
        data: {
          ...payload,
          followUpDate,
          doctorId: doctor.id,
          patientId: appointment.patientId,
        },
      });

      const pdfBuffer = await generatePrescriptionPDF({
        doctorName: doctor.name,
        doctorEmail: doctor.email,
        patientName: appointment.patient.name,
        patientEmail: appointment.patient.email,
        appointmentDate: appointment.schedule.startDateTime,
        followUpDate: followUpDate,
        instructions: payload.instructions,
        prescriptionId: result.id,
        createdAt: new Date(),
      });

      const filename = `prescription-${Date.now()}.pdf`;
      const uploadedFile = await uploadFileToCloudinary(pdfBuffer, filename);
      const pdfUrl = uploadedFile.secure_url;

      const updatedPrescription = await tx.prescription.update({
        where: {
          id: result.id,
        },
        data: {
          pdfUrl,
        },
      });

      try {
        const patient = appointment.patient;
        const doctor = appointment.doctor;

        await sendEmail({
          to: patient.email,
          subject: `You have received a new prescription from Dr. ${doctor.name}`,
          templateName: "prescription",
          templateData: {
            doctorName: doctor.name,
            doctorEmail: doctor.email,
            specialization: doctor.specialties
              .map((s: any) => s.title)
              .join(", "),
            patientName: patient.name,
            patientEmail: patient.email,
            appointmentDate:
              appointment.schedule.startDateTime.toLocaleString(),
            followUpDate: payload.followUpDate.toLocaleString(),
            instructions: payload.instructions,
            pdfUrl: pdfUrl,
            issuedDate: new Date().toLocaleDateString(),
            prescriptionId: result.id,
          },
          attachments: [
            {
              filename: "prescription.pdf",
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (error) {
        console.error("Error sending prescription email:", error);
      }

      return updatedPrescription;
    },
    {
      maxWait: 15000, // 15 seconds
      timeout: 20000, // 20 seconds
    },
  );

  return prescription;
};

// PATCH | "/api/v1/prescriptions/:id" | Update prescription instructions or follow-up date (Doctor only)
const updatePrescription = async (
  user: TRequestUser,
  prescriptionId: string,
  payload: any,
) => {
  // Verify user exists
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new NotFoundError("User not found");
  }

  // Fetch current prescription data
  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  // Verify the user is the doctor for this prescription
  if (user?.email !== prescriptionData.doctor.email) {
    throw new BadRequestError("This is not your prescription!");
  }

  // Prepare updated data
  const updatedInstructions =
    payload.instructions || prescriptionData.instructions;
  const updatedFollowUpDate = payload.followUpDate
    ? new Date(payload.followUpDate)
    : prescriptionData.followUpDate;

  // Step 1: Generate new PDF with updated data
  const pdfBuffer = await generatePrescriptionPDF({
    doctorName: prescriptionData.doctor.name,
    doctorEmail: prescriptionData.doctor.email,
    patientName: prescriptionData.patient.name,
    patientEmail: prescriptionData.patient.email,
    appointmentDate: prescriptionData.appointment.schedule.startDateTime,
    instructions: updatedInstructions,
    followUpDate: updatedFollowUpDate,
    prescriptionId: prescriptionData.id,
    createdAt: prescriptionData.createdAt,
  });

  // Step 2: Upload new PDF to Cloudinary
  const fileName = `prescription-updated-${Date.now()}.pdf`;
  const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
  const newPdfUrl = uploadedFile.secure_url;

  // Step 3: Delete old PDF from Cloudinary if it exists
  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      // Log but don't fail
      console.error("Failed to delete old PDF from Cloudinary:", deleteError);
    }
  }

  // Step 4: Update prescription in database
  const result = await prisma.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: {
      instructions: updatedInstructions,
      followUpDate: updatedFollowUpDate,
      pdfUrl: newPdfUrl,
    },
    include: {
      patient: true,
      doctor: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  // Step 5: Send updated prescription email to patient
  try {
    await sendEmail({
      to: result.patient.email,
      subject: `Your Prescription has been Updated by ${result.doctor.name}`,
      templateName: "prescription",
      templateData: {
        patientName: result.patient.name,
        doctorName: result.doctor.name,
        specialization: "Healthcare Provider",
        prescriptionId: result.id,
        appointmentDate: new Date(
          result.appointment.schedule.startDateTime,
        ).toLocaleString(),
        issuedDate: new Date(result.createdAt).toLocaleDateString(),
        followUpDate: new Date(result.followUpDate).toLocaleDateString(),
        instructions: result.instructions,
        pdfUrl: newPdfUrl,
      },
      attachments: [
        {
          filename: `Prescription-${result.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (emailError) {
    // Log email error but don't fail the prescription update
    console.error("Failed to send updated prescription email:", emailError);
  }

  return result;
};

// DELETE | "/api/v1/prescriptions/:id" | Delete a prescription (Doctor only)
const deletePrescription = async (
  user: TRequestUser,
  prescriptionId: string,
) => {
  // Verify user exists
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new NotFoundError("User not found");
  }

  // Fetch prescription data
  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
    },
  });

  // Verify the user is the doctor for this prescription
  if (user?.email !== prescriptionData.doctor.email) {
    throw new BadRequestError("This is not your prescription!");
  }

  // Delete PDF from Cloudinary if it exists
  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      // Log but don't fail - still delete from database
      console.error("Failed to delete PDF from Cloudinary:", deleteError);
    }
  }

  // Delete prescription from database
  await prisma.prescription.delete({
    where: {
      id: prescriptionId,
    },
  });
};

export const PrescriptionService = {
  createPrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
