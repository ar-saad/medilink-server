import { PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import { BadRequestError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";

const getDashboardStatsData = async (user: TRequestUser) => {
  let statsData;

  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      statsData = getSuperAdminDashboardStatsData();
      break;
    case UserRole.ADMIN:
      statsData = getAdminDashboardStatsData();
      break;
    case UserRole.DOCTOR:
      statsData = getDoctorDashboardStatsData(user);
      break;
    case UserRole.PATIENT:
      statsData = getPatientDashboardStatsData(user);
      break;

    default:
      throw new BadRequestError("Invalid user role");
  }

  return statsData;
};

const getSuperAdminDashboardStatsData = async () => {
  const userCount = await prisma.user.count();
  const superAdminCount = await prisma.superAdmin.count();
  const adminCount = await prisma.admin.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  });

  return {
    userCount,
    superAdminCount,
    adminCount,
    doctorCount,
    patientCount,
    appointmentCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getAdminDashboardStatsData = async () => {
  const userCount = await prisma.user.count();
  const adminCount = await prisma.admin.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  });

  return {
    userCount,
    adminCount,
    doctorCount,
    patientCount,
    appointmentCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getDoctorDashboardStatsData = async (user: TRequestUser) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
    include: {
      appointments: true,
      reviews: true,
      user: true,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: { doctorId: doctor.id },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: { id: true },
    where: { doctorId: doctor.id },
  });

  const reviewCount = await prisma.review.count({
    where: { doctorId: doctor.id },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      appointment: { doctorId: doctor.id },
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { doctorId: doctor.id },
  });
  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

  return {
    doctorName: doctor.user.name,
    appointmentCount,
    patientCount: patientCount.length,
    reviewCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

const getPatientDashboardStatsData = async (user: TRequestUser) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
    include: {
      appointments: true,
      reviews: true,
      user: true,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: { patientId: patient.id },
  });
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { patientId: patient.id },
  });
  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

  const reviewCount = await prisma.review.count({
    where: { patientId: patient.id },
  });

  return {
    patientName: patient.user.name,
    appointmentCount,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
    reviewCount,
  };
};

export const StatisticsService = {
  getDashboardStatsData,
};
