import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { env } from "../config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import ms, { StringValue } from "ms";

// Create access token
const createAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRATION,
    } as SignOptions,
  );
  return accessToken;
};

// Create refresh token
const createRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRATION,
    } as SignOptions,
  );
  return refreshToken;
};

// Set access token in cookie
const setAccessTokenCookie = (res: Response, token: string) => {
  const maxAge = ms(env.ACCESS_TOKEN_EXPIRATION as StringValue);
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: Number(maxAge),
  });
};

// Set refresh token in cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  const maxAge = ms(env.REFRESH_TOKEN_EXPIRATION as StringValue);
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: Number(maxAge),
  });
};

// Set better-auth session token in cookie
const setBetterAuthSessionCookie = (res: Response, token: string) => {
  const maxAge = ms(env.BETTER_AUTH_SESSION_TOKEN_EXPIRATION as StringValue);
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: Number(maxAge),
  });
};

export const tokenUtils = {
  createAccessToken,
  createRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
