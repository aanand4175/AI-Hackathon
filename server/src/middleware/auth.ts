import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "farmprofit_admin_secret_key_2026";

export interface AdminAuthRequest extends Request {
  adminId?: string;
}

export const adminAuth = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res
        .status(401)
        .json({
          success: false,
          error: "Authentication required. No token provided.",
        });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};
