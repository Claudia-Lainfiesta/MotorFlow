import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
const admins = () =>
  (process.env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ status: 999, message: "Token de acceso requerido" });
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload & { cusername: string };
    req.user = { ...decoded, isAdmin: admins().includes(decoded.cusername) };
    next();
  } catch {
    return res
      .status(401)
      .json({ status: 999, message: "Token inválido o expirado" });
  }
}
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin)
    return res
      .status(403)
      .json({ status: 999, message: "Acceso exclusivo para administradores" });
  next();
}
