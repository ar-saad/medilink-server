import { UserRole } from "../../generated/prisma/enums";

export type TRequestUser = {
  id: string;
  email: string;
  role: UserRole;
};
