import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { ForbiddenError, UnauthorizedError } from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { env } from "../config/env";

export const checkAuth =
  (...userRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verify Better Auth session token
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new UnauthorizedError(
          "Unauthorized access: No session token provided",
        );
      }

      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;

        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifetime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();

        const percentageRemaining = (timeRemaining / sessionLifetime) * 100;

        if (percentageRemaining < 20) {
          res.setHeader("X-Session-Expiring", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Session-Remaining", timeRemaining.toString());

          console.log(
            "Session is expiring soon. Remaining time (ms):",
            timeRemaining,
          );
        }

        if (
          user.status === UserStatus.BLOCKED ||
          user.status === UserStatus.DELETED
        ) {
          throw new UnauthorizedError(
            "Unauthorized access: User is not active",
          );
        }

        if (user.isDeleted) {
          throw new UnauthorizedError("Unauthorized access: User is deleted");
        }

        if (userRoles.length > 0 && !userRoles.includes(user.role)) {
          throw new ForbiddenError(
            "Forbidden access: User does not have the required permission to access this resource",
          );
        }

        req.user = {
          id: user.id,
          role: user.role,
          email: user.email,
        };
      }

      // Verify access token
      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new UnauthorizedError(
          "Unauthorized access: No access token provided",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        env.JWT_ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken.success) {
        throw new UnauthorizedError(
          "Unauthorized access: Invalid access token",
        );
      }

      if (
        userRoles.length > 0 &&
        !userRoles.includes(verifiedToken.data!.role as UserRole)
      ) {
        throw new ForbiddenError(
          "Forbidden access: User does not have the required permission to access this resource",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
