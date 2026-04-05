import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (payload: { userId: string; email: string }) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = () => {
  // Opaque random token stored in DB
  return crypto.randomBytes(64).toString("hex");
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string; email: string };
};

export const getRefreshTokenExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days
  return date;
};
