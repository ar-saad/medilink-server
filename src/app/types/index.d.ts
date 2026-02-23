import { UserRole } from "../../generated/prisma/enums";
import { TRequestUser } from "./requestUser.type";

declare global {
  namespace Express {
    interface Request {
      user: TRequestUser;
    }
  }
}
