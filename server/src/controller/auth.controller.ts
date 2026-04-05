import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const data = await registerUser(name, email, password);
    return res.status(201).json(data);
  } catch (err: any) {
    if (err.message === "User already exists") {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const data = await loginUser(email, password);
    return res.json(data);
  } catch (err: any) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ message: err.message });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const tokens = await refreshUserToken(refreshToken);
    return res.json(tokens);
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await logoutUser(refreshToken);
    }
    return res.json({ message: "Logged out successfully" });
  } catch {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
