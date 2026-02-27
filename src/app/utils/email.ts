import nodemailer from "nodemailer";
import { env } from "../config/env";
import { AppError } from "../errorHelpers/AppError";
import status from "http-status";
import path from "path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: env.EMAIL_SENDER.SMTP_USER,
    pass: env.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(env.EMAIL_SENDER.SMTP_PORT),
});

type SendEmailOptions = {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType: string;
  }>;
};

export const sendEmail = async (options: SendEmailOptions) => {
  try {
    const { subject, templateName, templateData, to, attachments } = options;

    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: `"MediLink", <${env.EMAIL_SENDER.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
      attachments:
        attachments?.map((attachments) => ({
          filename: attachments.filename,
          content: attachments.content,
          contentType: attachments.contentType,
        })) || [],
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.log("Error sending email:", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      `Failed to send email: ${error}`,
    );
  }
};
